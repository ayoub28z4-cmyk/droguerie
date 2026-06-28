<?php

namespace App\Services;

use App\Enums\TypeMouvement;
use App\Models\Inventaire;
use App\Models\InventaireLigne;
use App\Models\Produit;
use App\Models\StockMouvement;
use Illuminate\Support\Facades\DB;

class InventaireService
{
    public function creer(array $data): Inventaire
    {
        return DB::transaction(function () use ($data) {
            $inventaire = Inventaire::create([
                'personnel_id'    => auth('personnel')->id(),
                'statut'          => 'brouillon',
                'date_inventaire' => $data['date_inventaire'],
                'notes'           => $data['notes'] ?? null,
            ]);

            // Charger tous les produits en une seule requête
            $produitIds = array_column($data['lignes'], 'produit_id');
            $produits = Produit::findMany($produitIds)->keyBy('id');

            $lignes = [];
            foreach ($data['lignes'] as $ligneData) {
                $produit = $produits->get($ligneData['produit_id']);
                abort_if(! $produit, 422, "Produit #{$ligneData['produit_id']} introuvable.");

                $lignes[] = [
                    'inventaire_id'   => $inventaire->id,
                    'produit_id'      => $produit->id,
                    'stock_theorique' => $produit->stock_actuel,
                    'stock_reel'      => $ligneData['stock_reel'],
                    'motif_ecart'     => $ligneData['motif_ecart'] ?? null,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ];
            }

            InventaireLigne::insert($lignes);

            return $inventaire->load('lignes.produit');
        });
    }

    public function valider(Inventaire $inventaire): void
    {
        DB::transaction(function () use ($inventaire) {
            if ($inventaire->statut !== 'brouillon') {
                throw new \RuntimeException("Seul un inventaire brouillon peut être validé.");
            }

            // Charger les lignes une seule fois avant la boucle
            $inventaire->loadMissing('lignes');

            foreach ($inventaire->lignes as $ligne) {
                $ecart = (float) $ligne->stock_reel - (float) $ligne->stock_theorique;

                if ($ecart === 0.0) {
                    continue;
                }

                $produit    = Produit::lockForUpdate()->findOrFail($ligne->produit_id);
                $stockAvant = (float) $produit->stock_actuel;
                $produit->update(['stock_actuel' => $ligne->stock_reel]);

                StockMouvement::create([
                    'produit_id'     => $produit->id,
                    'personnel_id'   => auth('personnel')->id(),
                    'type_mouvement' => TypeMouvement::Inventaire,
                    'quantite'       => abs($ecart),
                    'stock_avant'    => $stockAvant,
                    'stock_apres'    => (float) $ligne->stock_reel,
                    'prix_unitaire'  => $produit->prix_achat,
                    'motif'          => "Inventaire #{$inventaire->id}" . ($ligne->motif_ecart ? " — {$ligne->motif_ecart}" : ''),
                    'created_at'     => now(),
                ]);
            }

            $inventaire->update([
                'statut'       => 'valide',
                'validated_at' => now(),
            ]);
        });
    }
}
