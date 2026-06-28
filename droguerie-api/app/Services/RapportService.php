<?php

namespace App\Services;

use App\Enums\StatutCommande;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\StockMouvement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RapportService
{
    public function tableauDeBord(): array
    {
        $debutMois     = Carbon::now()->startOfMonth();
        $finMois       = Carbon::now()->endOfMonth();
        $debutPrecedent= Carbon::now()->subMonth()->startOfMonth();
        $finPrecedent  = Carbon::now()->subMonth()->endOfMonth();

        $caMois      = $this->caTotal($debutMois, $finMois);
        $caPrecedent = $this->caTotal($debutPrecedent, $finPrecedent);
        $encaisseMois = $this->encaisseTotal($debutMois, $finMois);

        return [
            'ca_mois'               => $caMois,
            'ca_mois_precedent'     => $caPrecedent,
            'encaisse_mois'         => $encaisseMois,
            'nb_commandes_en_cours' => Commande::whereNotIn('statut', [
                StatutCommande::Cloturee->value,
                StatutCommande::Annulee->value,
            ])->count(),
            'nb_alertes_stock'      => Produit::alerteStock()->count(),
            'nb_clients_actifs'     => \App\Models\Client::actif()->count(),
            'chiffre_affaires_semaine' => $this->caParJour(7),
            'repartition_statuts'   => $this->repartitionStatuts(),
            'top_produits'          => $this->topProduitsFormatted(5, $debutMois, $finMois),
        ];
    }

    private function caTotal(Carbon $debut, Carbon $fin): float
    {
        // CA = commandes effectivement livrées ou clôturées (pas les simples en_attente/confirmées)
        return (float) Commande::whereBetween('created_at', [$debut, $fin])
            ->whereIn('statut', [StatutCommande::Livree->value, StatutCommande::Cloturee->value])
            ->sum('montant_ttc');
    }

    private function encaisseTotal(Carbon $debut, Carbon $fin): float
    {
        return (float) Commande::whereBetween('created_at', [$debut, $fin])
            ->whereIn('statut', [StatutCommande::Livree->value, StatutCommande::Cloturee->value])
            ->sum('montant_paye');
    }

    private function caParJour(int $jours): array
    {
        $result = [];
        for ($i = $jours - 1; $i >= 0; $i--) {
            $date  = Carbon::now()->subDays($i)->toDateString();
            $total = (float) Commande::whereDate('created_at', $date)
                ->whereIn('statut', [StatutCommande::Livree->value, StatutCommande::Cloturee->value])
                ->sum('montant_ttc');
            $result[] = ['date' => $date, 'total' => $total];
        }
        return $result;
    }

    private function repartitionStatuts(): array
    {
        return Commande::selectRaw('statut, COUNT(*) as count')
            ->groupBy('statut')
            ->orderBy('count', 'desc')
            ->get()
            ->map(fn($row) => ['statut' => $row->statut->value, 'count' => (int) $row->count])
            ->values()
            ->toArray();
    }

    private function topProduitsFormatted(int $limite, Carbon $debut, Carbon $fin): array
    {
        $rows = DB::table('commande_lignes')
            ->join('commandes', 'commande_lignes.commande_id', '=', 'commandes.id')
            ->whereBetween('commandes.created_at', [$debut, $fin])
            ->whereNotIn('commandes.statut', [StatutCommande::Annulee->value])
            ->whereNull('commandes.deleted_at')
            ->select(
                'commande_lignes.produit_id',
                DB::raw('SUM(commande_lignes.quantite) as total_vendu'),
                DB::raw('SUM(commande_lignes.total_ht) as ca')
            )
            ->groupBy('commande_lignes.produit_id')
            ->orderByDesc('ca')
            ->limit($limite)
            ->get();

        $produits = Produit::whereIn('id', $rows->pluck('produit_id'))
            ->with('categorie')
            ->get()
            ->keyBy('id');

        return $rows->map(function ($row) use ($produits) {
            $produit = $produits[$row->produit_id] ?? null;
            if (! $produit) return null;

            return [
                'produit'     => (new \App\Http\Resources\ProduitResource($produit))->resolve(),
                'total_vendu' => (float) $row->total_vendu,
                'ca'          => (float) $row->ca,
            ];
        })->filter()->values()->toArray();
    }

    public function chiffreAffairesPeriode(Carbon $debut, Carbon $fin): array
    {
        $totaux = Commande::whereBetween('created_at', [$debut, $fin])
            ->where('statut', '!=', StatutCommande::Annulee->value)
            ->selectRaw('
                COUNT(*) as nb_commandes,
                COALESCE(SUM(montant_ht), 0) as total_ht,
                COALESCE(SUM(tva), 0) as total_tva,
                COALESCE(SUM(montant_ttc), 0) as total_ttc,
                COALESCE(SUM(montant_paye), 0) as total_encaisse,
                COALESCE(SUM(reste_a_payer), 0) as total_restant
            ')
            ->first()?->toArray() ?? [
                'nb_commandes'   => 0,
                'total_ht'       => 0,
                'total_tva'      => 0,
                'total_ttc'      => 0,
                'total_encaisse' => 0,
                'total_restant'  => 0,
            ];

        $totaux['par_periode'] = $this->caParPeriode($debut, $fin);

        return $totaux;
    }

    private function caParPeriode(Carbon $debut, Carbon $fin): array
    {
        $rows = DB::table('commandes')
            ->whereBetween('created_at', [$debut->startOfDay(), $fin->copy()->endOfDay()])
            ->where('statut', '!=', StatutCommande::Annulee->value)
            ->selectRaw("DATE(created_at) as periode, COUNT(*) as nb_commandes, COALESCE(SUM(montant_ttc), 0) as total_ttc")
            ->groupBy('periode')
            ->orderBy('periode')
            ->get()
            ->keyBy('periode');

        $result = [];
        $current = $debut->copy()->startOfDay();
        $end     = $fin->copy()->startOfDay();
        while ($current->lte($end)) {
            $key = $current->toDateString();
            $row = $rows[$key] ?? null;
            $result[] = [
                'periode'       => $key,
                'total_ttc'     => $row ? (float) $row->total_ttc : 0,
                'nb_commandes'  => $row ? (int) $row->nb_commandes : 0,
            ];
            $current->addDay();
        }

        return $result;
    }

    public function mouvementsStock(int $produitId, Carbon $debut, Carbon $fin): \Illuminate\Database\Eloquent\Collection
    {
        return StockMouvement::where('produit_id', $produitId)
            ->whereBetween('created_at', [$debut, $fin])
            ->with('personnel')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function topProduits(int $limite = 10, ?Carbon $debut = null, ?Carbon $fin = null): array
    {
        $debut ??= Carbon::now()->startOfMonth();
        $fin   ??= Carbon::now()->endOfMonth();

        $rows = DB::table('commande_lignes')
            ->join('commandes', 'commande_lignes.commande_id', '=', 'commandes.id')
            ->whereBetween('commandes.created_at', [$debut, $fin])
            ->whereNotIn('commandes.statut', [StatutCommande::Annulee->value])
            ->whereNull('commandes.deleted_at')
            ->select(
                'commande_lignes.produit_id',
                DB::raw('SUM(commande_lignes.quantite) as quantite_vendue'),
                DB::raw('SUM(commande_lignes.total_ht) as ca_ht'),
                DB::raw('SUM(commande_lignes.total_ht * (1 + commande_lignes.tva / 100)) as ca_ttc')
            )
            ->groupBy('commande_lignes.produit_id')
            ->orderByDesc('ca_ttc')
            ->limit($limite)
            ->get();

        $produits = Produit::whereIn('id', $rows->pluck('produit_id'))
            ->with('categorie')
            ->get()
            ->keyBy('id');

        return $rows->map(function ($row) use ($produits) {
            $produit = $produits[$row->produit_id] ?? null;
            if (! $produit) return null;

            return [
                'produit'         => (new \App\Http\Resources\ProduitResource($produit))->resolve(),
                'quantite_vendue' => (float) $row->quantite_vendue,
                'ca_ht'           => (float) $row->ca_ht,
                'ca_ttc'          => (float) $row->ca_ttc,
            ];
        })->filter()->values()->toArray();
    }
}
