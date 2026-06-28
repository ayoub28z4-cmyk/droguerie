<?php

namespace App\Services;

use App\Enums\TypeMouvement;
use App\Exceptions\StockInsuffisantException;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\StockMouvement;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function deduireStock(Commande $commande): void
    {
        DB::transaction(function () use ($commande) {
            foreach ($commande->lignes as $ligne) {
                $produit = Produit::lockForUpdate()->findOrFail($ligne->produit_id);

                if ($produit->stock_actuel < $ligne->quantite) {
                    throw new StockInsuffisantException($produit);
                }

                $stockAvant = (float) $produit->stock_actuel;
                $stockApres = $stockAvant - (float) $ligne->quantite;
                $produit->decrement('stock_actuel', $ligne->quantite);

                StockMouvement::create([
                    'produit_id'     => $produit->id,
                    'personnel_id'   => auth('personnel')->id(),
                    'commande_id'    => $commande->id,
                    'type_mouvement' => TypeMouvement::Sortie,
                    'quantite'       => $ligne->quantite,
                    'stock_avant'    => $stockAvant,
                    'stock_apres'    => $stockApres,
                    'prix_unitaire'  => $ligne->prix_unitaire_ht,
                    'motif'          => "Commande #{$commande->numero}",
                    'created_at'     => now(),
                ]);
            }
        });
    }

    public function retournerStock(Commande $commande): void
    {
        DB::transaction(function () use ($commande) {
            foreach ($commande->lignes as $ligne) {
                $produit = Produit::lockForUpdate()->findOrFail($ligne->produit_id);
                $stockAvant = (float) $produit->stock_actuel;
                $stockApres = $stockAvant + (float) $ligne->quantite;
                $produit->increment('stock_actuel', $ligne->quantite);

                StockMouvement::create([
                    'produit_id'     => $produit->id,
                    'personnel_id'   => auth('personnel')->id(),
                    'commande_id'    => $commande->id,
                    'type_mouvement' => TypeMouvement::Retour,
                    'quantite'       => $ligne->quantite,
                    'stock_avant'    => $stockAvant,
                    'stock_apres'    => $stockApres,
                    'prix_unitaire'  => $ligne->prix_unitaire_ht,
                    'motif'          => "Retour commande #{$commande->numero}",
                    'created_at'     => now(),
                ]);
            }
        });
    }

    public function ajuster(int $produitId, float $quantite, TypeMouvement $type, string $motif, float $prixUnitaire = 0): StockMouvement
    {
        return DB::transaction(function () use ($produitId, $quantite, $type, $motif, $prixUnitaire) {
            $produit = Produit::lockForUpdate()->findOrFail($produitId);
            $stockAvant = (float) $produit->stock_actuel;

            if ($type === TypeMouvement::Ajustement) {
                // L'ajustement accepte une quantité signée (positive = entrée, négative = sortie)
                // sans vérification de stock — c'est une correction manuelle volontaire.
                $stockApres = max(0, $stockAvant + $quantite);
                $produit->update(['stock_actuel' => $stockApres]);
            } elseif ($type->estEntree()) {
                $stockApres = $stockAvant + $quantite;
                $produit->increment('stock_actuel', $quantite);
            } else {
                if ($produit->stock_actuel < $quantite) {
                    throw new StockInsuffisantException($produit);
                }
                $stockApres = $stockAvant - $quantite;
                $produit->decrement('stock_actuel', $quantite);
            }

            $mouvement = StockMouvement::create([
                'produit_id'     => $produit->id,
                'personnel_id'   => auth('personnel')->id(),
                'type_mouvement' => $type,
                'quantite'       => $quantite,
                'stock_avant'    => $stockAvant,
                'stock_apres'    => $stockApres,
                'prix_unitaire'  => $prixUnitaire,
                'motif'          => $motif,
                'created_at'     => now(),
            ]);

            $signe = $quantite >= 0 ? "+{$quantite}" : "{$quantite}";
            AuditService::log(
                'stock_ajuste',
                "Stock ajusté : {$signe} {$produit->unite} de {$produit->designation} ({$motif})",
                $produit
            );

            return $mouvement;
        });
    }
}
