<?php

namespace App\Services;

use App\Enums\StatutApprovisionnement;
use App\Enums\TypeMouvement;
use App\Exceptions\TransitionStatutInvalideException;
use App\Models\Approvisionnement;
use App\Models\ApprovisionnementLigne;
use App\Models\Produit;
use App\Models\StockMouvement;
use App\Notifications\ApprovisionnementRecuNotification;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ApprovisionnementService
{
    public function creer(array $data): Approvisionnement
    {
        return DB::transaction(function () use ($data) {
            $approvisionnement = Approvisionnement::create([
                'fournisseur_id' => $data['fournisseur_id'],
                'personnel_id'   => auth('personnel')->id(),
                'numero_bl'      => $data['numero_bl'] ?? null,
                'statut'         => StatutApprovisionnement::Brouillon,
                'date_reception' => $data['date_reception'] ?? null,
                'notes'          => $data['notes'] ?? null,
            ]);

            $montantTotal = 0;

            foreach ($data['lignes'] as $ligneData) {
                $total = (float) $ligneData['prix_achat_unitaire'] * (float) $ligneData['quantite_commandee'];

                ApprovisionnementLigne::create([
                    'approvisionnement_id' => $approvisionnement->id,
                    'produit_id'           => $ligneData['produit_id'],
                    'quantite_commandee'   => $ligneData['quantite_commandee'],
                    'quantite_recue'       => 0,
                    'prix_achat_unitaire'  => $ligneData['prix_achat_unitaire'],
                    'total_ht'             => $total,
                ]);

                $montantTotal += $total;
            }

            $approvisionnement->update(['montant_total' => $montantTotal]);

            AuditService::log('appro_cree', "Approvisionnement #{$approvisionnement->id} créé", $approvisionnement);

            return $approvisionnement->load('lignes.produit', 'fournisseur');
        });
    }

    public function transitionner(Approvisionnement $approvisionnement, StatutApprovisionnement $nouveau): void
    {
        if (! $approvisionnement->statut->peutPasserA($nouveau)) {
            throw new TransitionStatutInvalideException(
                $approvisionnement->statut->value,
                $nouveau->value,
                'approvisionnement'
            );
        }

        $approvisionnement->update(['statut' => $nouveau]);

        $labels = [
            StatutApprovisionnement::Commande->value    => 'commandé',
            StatutApprovisionnement::EnTransit->value   => 'mis en transit',
            StatutApprovisionnement::Receptionne->value => 'réceptionné',
            StatutApprovisionnement::Valide->value      => 'validé',
        ];
        $label = $labels[$nouveau->value] ?? $nouveau->value;
        AuditService::log('appro_statut', "Approvisionnement #{$approvisionnement->id} {$label}", $approvisionnement);
    }

    public function receptionner(Approvisionnement $approvisionnement, array $data): void
    {
        DB::transaction(function () use ($approvisionnement, $data) {
            $this->transitionner($approvisionnement, StatutApprovisionnement::Receptionne);

            $approvisionnement->update(['date_reception' => $data['date_reception']]);

            foreach ($data['lignes'] as $ligneData) {
                $ligne = ApprovisionnementLigne::findOrFail($ligneData['id']);
                $ligne->update([
                    'quantite_recue'      => $ligneData['quantite_recue'],
                    'prix_achat_unitaire' => $ligneData['prix_achat_unitaire'] ?? $ligne->prix_achat_unitaire,
                    'total_ht'            => (float) ($ligneData['prix_achat_unitaire'] ?? $ligne->prix_achat_unitaire)
                                            * (float) $ligneData['quantite_recue'],
                ]);
            }

            $approvisionnement->update([
                'montant_total' => $approvisionnement->lignes()->sum('total_ht'),
            ]);
        });
    }

    public function valider(Approvisionnement $approvisionnement): void
    {
        DB::transaction(function () use ($approvisionnement) {
            $this->transitionner($approvisionnement, StatutApprovisionnement::Valide);

            foreach ($approvisionnement->lignes as $ligne) {
                if ($ligne->quantite_recue <= 0) {
                    continue;
                }

                $produit = Produit::lockForUpdate()->findOrFail($ligne->produit_id);
                $stockAvant = (float) $produit->stock_actuel;
                $produit->increment('stock_actuel', $ligne->quantite_recue);

                $produit->update(['prix_achat' => $ligne->prix_achat_unitaire]);

                StockMouvement::create([
                    'produit_id'           => $produit->id,
                    'personnel_id'         => auth('personnel')->id(),
                    'approvisionnement_id' => $approvisionnement->id,
                    'fournisseur_id'       => $approvisionnement->fournisseur_id,
                    'type_mouvement'       => TypeMouvement::Entree,
                    'quantite'             => $ligne->quantite_recue,
                    'stock_avant'          => $stockAvant,
                    'stock_apres'          => $produit->fresh()->stock_actuel,
                    'prix_unitaire'        => $ligne->prix_achat_unitaire,
                    'motif'                => "Approvisionnement #{$approvisionnement->id}",
                    'created_at'           => now(),
                ]);
            }

            $admins = \App\Models\Personnel::role('admin')->get();
            Notification::send($admins, new ApprovisionnementRecuNotification($approvisionnement));
        });
    }
}
