<?php

namespace App\Observers;

use App\Enums\StatutProduit;
use App\Models\Personnel;
use App\Models\Produit;
use App\Notifications\StockSousMinimumNotification;
use Illuminate\Support\Facades\Notification;

class ProduitObserver
{
    public function updated(Produit $produit): void
    {
        if (! $produit->wasChanged('stock_actuel')) {
            return;
        }

        $this->mettreAJourStatut($produit);
        $this->verifierAlerteStock($produit);
    }

    private function mettreAJourStatut(Produit $produit): void
    {
        $stockActuel = (float) $produit->stock_actuel;

        $nouveauStatut = match(true) {
            $stockActuel <= 0                            => StatutProduit::Rupture,
            $produit->statut === StatutProduit::Rupture  => StatutProduit::Actif,
            default                                      => null,
        };

        if ($nouveauStatut !== null && $produit->statut !== $nouveauStatut) {
            $produit->statut = $nouveauStatut;
            $produit->saveQuietly();
        }
    }

    private function verifierAlerteStock(Produit $produit): void
    {
        $estSousMinimum = (float) $produit->stock_actuel <= (float) $produit->stock_minimum;
        $stockAvantChangement = (float) $produit->getOriginal('stock_actuel');
        $etaitDejaEnAlerte = $stockAvantChangement <= (float) $produit->stock_minimum;

        // N'envoyer la notification que si on vient de passer sous le seuil
        if (! $estSousMinimum || $etaitDejaEnAlerte) {
            return;
        }

        $destinataires = Personnel::actif()
            ->role(['admin', 'magasinier'])
            ->get();

        Notification::send($destinataires, new StockSousMinimumNotification($produit));
    }
}
