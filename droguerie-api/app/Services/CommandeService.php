<?php

namespace App\Services;

use App\Enums\CanalCommande;
use App\Enums\StatutCommande;
use App\Enums\TypeClient;
use App\Exceptions\CreditLimiteDepasseException;
use App\Exceptions\TransitionStatutInvalideException;
use App\Models\Client;
use App\Models\Commande;
use App\Models\CommandeLigne;
use App\Models\Produit;
use App\Notifications\CommandeAnnuleeNotification;
use App\Notifications\CommandeConfirmeeNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\AuditService;

class CommandeService
{
    public function __construct(private readonly StockService $stockService) {}

    public function creer(array $data): Commande
    {
        return DB::transaction(function () use ($data) {
            $client = Client::lockForUpdate()->findOrFail($data['client_id']);

            // Le canal est forcé à "portail" pour toute commande créée par un client authentifié
            $canal = auth('client')->check()
                ? CanalCommande::Portail
                : ($data['canal'] ?? CanalCommande::Magasin);

            $commande = Commande::create([
                'numero'         => $this->genererNumero(),
                'client_id'      => $client->id,
                'personnel_id'   => auth('personnel')->id(),
                'statut'         => StatutCommande::EnAttente,
                'canal'          => $canal,
                'date_livraison' => $data['date_livraison'] ?? null,
                'notes'          => $data['notes'] ?? null,
            ]);

            $montantHt = 0;
            $montantTva = 0;

            foreach ($data['lignes'] as $ligneData) {
                $produit = Produit::findOrFail($ligneData['produit_id']);
                $prixUnitaire = $ligneData['prix_unitaire_ht'] ?? $produit->prix_vente_ht;
                $totalHt = (float) $prixUnitaire * (float) $ligneData['quantite'];
                $tvaMontant = $totalHt * ((float) $produit->tva / 100);

                CommandeLigne::create([
                    'commande_id'      => $commande->id,
                    'produit_id'       => $produit->id,
                    'quantite'         => $ligneData['quantite'],
                    'prix_unitaire_ht' => $prixUnitaire,
                    'tva'              => $produit->tva,
                    'total_ht'         => $totalHt,
                ]);

                $montantHt  += $totalHt;
                $montantTva += $tvaMontant;
            }

            $montantTtc = $montantHt + $montantTva;

            $this->verifierCreditClient($client, $montantTtc);

            $commande->update([
                'montant_ht'    => $montantHt,
                'tva'           => $montantTva,
                'montant_ttc'   => $montantTtc,
                'reste_a_payer' => $montantTtc,
            ]);

            // Incrémenter le solde dû pour les clients avec limite de crédit
            if (in_array($client->type_client, [TypeClient::Professionnel, TypeClient::Entreprise])) {
                $client->increment('solde_du', $montantTtc);
            }

            AuditService::log('commande_creee', "Commande {$commande->numero} créée pour {$client->nom}", $commande, ['numero' => $commande->numero, 'client' => $client->nom]);

            return $commande->load('lignes.produit', 'client');
        });
    }

    private function verifierCreditClient(Client $client, float $montantTtc): void
    {
        if (! in_array($client->type_client, [TypeClient::Professionnel, TypeClient::Entreprise])) {
            return;
        }

        if ((float) $client->credit_limite <= 0) {
            return;
        }

        $nouveauSolde = (float) $client->solde_du + $montantTtc;
        if ($nouveauSolde > (float) $client->credit_limite) {
            throw new CreditLimiteDepasseException(
                (float) $client->credit_limite,
                (float) $client->solde_du,
                $montantTtc
            );
        }
    }

    public function confirmer(Commande $commande): void
    {
        $this->transitionnerStatut($commande, StatutCommande::Confirmee);
        AuditService::log('commande_confirmee', "Commande {$commande->numero} confirmée", $commande, ['numero' => $commande->numero]);

        $commande->client->account?->notify(new CommandeConfirmeeNotification($commande));
    }

    public function mettreEnPreparation(Commande $commande): void
    {
        DB::transaction(function () use ($commande) {
            $this->transitionnerStatut($commande, StatutCommande::EnPreparation);
            $this->stockService->deduireStock($commande);
            AuditService::log('commande_en_preparation', "Commande {$commande->numero} passée en préparation", $commande, ['numero' => $commande->numero]);
        });
    }

    public function mettreEnLivraison(Commande $commande): void
    {
        $this->transitionnerStatut($commande, StatutCommande::EnLivraison);
        AuditService::log('commande_en_livraison', "Commande {$commande->numero} mise en livraison", $commande, ['numero' => $commande->numero]);
    }

    public function marquerLivree(Commande $commande): void
    {
        $this->transitionnerStatut($commande, StatutCommande::Livree);
        AuditService::log('commande_livree', "Commande {$commande->numero} marquée livrée", $commande, ['numero' => $commande->numero]);

        if ($commande->estPayee()) {
            $this->cloturerSiPayee($commande);
        }
    }

    public function cloturer(Commande $commande): void
    {
        $this->transitionnerStatut($commande, StatutCommande::Cloturee);
        AuditService::log('commande_cloturee', "Commande {$commande->numero} clôturée", $commande, ['numero' => $commande->numero]);
    }

    public function cloturerSiPayee(Commande $commande): void
    {
        if ($commande->estPayee() && $commande->statut === StatutCommande::Livree) {
            $this->transitionnerStatut($commande, StatutCommande::Cloturee);
        }
    }

    public function annuler(Commande $commande): void
    {
        DB::transaction(function () use ($commande) {
            $estEnPreparation = $commande->statut === StatutCommande::EnPreparation;
            $this->transitionnerStatut($commande, StatutCommande::Annulee);

            if ($estEnPreparation) {
                $this->stockService->retournerStock($commande);
            }

            // Restituer uniquement le reste dû (montant_ttc - ce qui a déjà été encaissé).
            // Utiliser reste_a_payer et non montant_ttc : les paiements validés ont déjà
            // décrémenté solde_du au moment de leur validation.
            if (in_array($commande->client->type_client, [TypeClient::Professionnel, TypeClient::Entreprise])) {
                $client = Client::lockForUpdate()->findOrFail($commande->client_id);
                $restitution = min((float) $commande->reste_a_payer, (float) $client->solde_du);
                if ($restitution > 0) {
                    $client->decrement('solde_du', $restitution);
                }
            }
        });

        AuditService::log('commande_annulee', "Commande {$commande->numero} annulée", $commande, ['numero' => $commande->numero]);

        $commande->client->account?->notify(new CommandeAnnuleeNotification($commande));
    }

    private function transitionnerStatut(Commande $commande, StatutCommande $nouveau): void
    {
        if (! $commande->statut->peutPasserA($nouveau)) {
            throw new TransitionStatutInvalideException(
                $commande->statut->value,
                $nouveau->value
            );
        }

        $commande->update(['statut' => $nouveau]);
    }

    private function genererNumero(): string
    {
        return 'CMD-' . date('Ymd') . '-' . strtoupper(Str::random(5));
    }
}
