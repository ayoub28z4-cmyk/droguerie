<?php

namespace App\Services;

use App\Enums\CanalCommande;
use App\Enums\StatutCommande;
use App\Enums\StatutPaiement;
use App\Enums\TypeMouvement;
use App\Exceptions\StockInsuffisantException;
use App\Models\Client;
use App\Models\Commande;
use App\Models\CommandeLigne;
use App\Models\Paiement;
use App\Models\Produit;
use App\Models\StockMouvement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VenteRapideService
{
    // ID du client Comptoir (ventes anonymes). Mise en cache statique.
    private static ?int $comptoirId = null;

    public function vendre(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $client     = $this->clientComptoir();
            $montantHt  = 0;
            $montantTva = 0;

            $commande = Commande::create([
                'numero'      => 'CAISSE-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'client_id'   => $client->id,
                'personnel_id'=> auth('personnel')->id(),
                'statut'      => StatutCommande::Cloturee,
                'canal'       => CanalCommande::Magasin,
                'montant_ht'  => 0,
                'tva'         => 0,
                'montant_ttc' => 0,
                'montant_paye'=> 0,
                'reste_a_payer' => 0,
            ]);

            foreach ($data['lignes'] as $item) {
                $produit = Produit::lockForUpdate()->findOrFail($item['produit_id']);

                if ((float) $produit->stock_actuel < (float) $item['quantite']) {
                    throw new StockInsuffisantException($produit);
                }

                $prixHt   = (float) $produit->prix_vente_ht;
                $totalHt  = $prixHt * (float) $item['quantite'];
                $tvaPct   = (float) $produit->tva;
                $tvaMt    = $totalHt * $tvaPct / 100;

                CommandeLigne::create([
                    'commande_id'      => $commande->id,
                    'produit_id'       => $produit->id,
                    'quantite'         => $item['quantite'],
                    'prix_unitaire_ht' => $prixHt,
                    'tva'              => $tvaPct,
                    'total_ht'         => $totalHt,
                ]);

                $stockAvant = (float) $produit->stock_actuel;
                $produit->decrement('stock_actuel', $item['quantite']);

                StockMouvement::create([
                    'produit_id'     => $produit->id,
                    'personnel_id'   => auth('personnel')->id(),
                    'commande_id'    => $commande->id,
                    'type_mouvement' => TypeMouvement::Sortie,
                    'quantite'       => $item['quantite'],
                    'stock_avant'    => $stockAvant,
                    'stock_apres'    => $stockAvant - (float) $item['quantite'],
                    'prix_unitaire'  => $prixHt,
                    'motif'          => "Vente caisse {$commande->numero}",
                    'created_at'     => now(),
                ]);

                $montantHt  += $totalHt;
                $montantTva += $tvaMt;
            }

            $montantTtc = round($montantHt + $montantTva, 2);

            $commande->update([
                'montant_ht'    => round($montantHt, 2),
                'tva'           => round($montantTva, 2),
                'montant_ttc'   => $montantTtc,
                'montant_paye'  => $montantTtc,
                'reste_a_payer' => 0,
            ]);

            Paiement::create([
                'commande_id'   => $commande->id,
                'client_id'     => $client->id,
                'personnel_id'  => auth('personnel')->id(),
                'montant'       => $montantTtc,
                'mode_paiement' => $data['mode_paiement'],
                'statut'        => StatutPaiement::Valide,
                'paid_at'       => now(),
                'reference'     => $data['reference'] ?? null,
                'notes'         => $data['notes'] ?? null,
            ]);

            AuditService::log(
                'vente_rapide',
                sprintf('Vente caisse %s — %d article(s) — %.2f MAD', $commande->numero, count($data['lignes']), $montantTtc),
                $commande
            );

            $monnaie = isset($data['montant_recu'])
                ? max(0, (float) $data['montant_recu'] - $montantTtc)
                : null;

            return [
                'numero'      => $commande->numero,
                'montant_ttc' => $montantTtc,
                'monnaie'     => $monnaie,
            ];
        });
    }

    public function chercherProduit(string $q): ?Produit
    {
        return Produit::where('code_barre', $q)
            ->orWhere('reference', $q)
            ->orWhere('designation', 'like', "%{$q}%")
            ->where('statut', '!=', 'archive')
            ->first();
    }

    private function clientComptoir(): Client
    {
        if (self::$comptoirId) {
            return Client::find(self::$comptoirId);
        }

        $client = Client::firstOrCreate(
            ['email' => 'comptoir@droguerie.local'],
            ['nom' => 'Comptoir', 'type_client' => 'particulier', 'actif' => true]
        );

        self::$comptoirId = $client->id;
        return $client;
    }
}
