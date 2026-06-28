<?php

namespace App\Providers;

use App\Models\Approvisionnement;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\Inventaire;
use App\Models\Paiement;
use App\Models\Personnel;
use App\Models\Produit;
use App\Observers\ProduitObserver;
use App\Policies\ApprovisionnementPolicy;
use App\Policies\CategoriePolicy;
use App\Policies\ClientPolicy;
use App\Policies\CommandePolicy;
use App\Policies\FournisseurPolicy;
use App\Policies\InventairePolicy;
use App\Policies\PaiementPolicy;
use App\Policies\PersonnelPolicy;
use App\Policies\ProduitPolicy;
use App\Policies\RapportPolicy;
use App\Policies\StockPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Policies model → policy
        Gate::policy(Categorie::class,       CategoriePolicy::class);
        Gate::policy(Produit::class,         ProduitPolicy::class);
        Gate::policy(Commande::class,        CommandePolicy::class);
        Gate::policy(Client::class,          ClientPolicy::class);
        Gate::policy(Fournisseur::class,     FournisseurPolicy::class);
        Gate::policy(Approvisionnement::class, ApprovisionnementPolicy::class);
        Gate::policy(Inventaire::class,      InventairePolicy::class);
        Gate::policy(Paiement::class,        PaiementPolicy::class);
        Gate::policy(Personnel::class,       PersonnelPolicy::class);

        // Abilities sans modèle associé — Gate::define() obligatoire
        Gate::define('stock.view',    [StockPolicy::class, 'viewAny']);
        Gate::define('stock.create',  [StockPolicy::class, 'create']);
        Gate::define('stock.ajuster', [StockPolicy::class, 'ajuster']);
        Gate::define('rapports.view', [RapportPolicy::class, 'view']);

        // Observers
        Produit::observe(ProduitObserver::class);
    }
}
