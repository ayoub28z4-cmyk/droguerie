<?php

use App\Http\Controllers\Api\ApprovisionnementController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\Auth\ClientAuthController;
use App\Http\Controllers\Api\Auth\PersonnelAuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\FournisseurController;
use App\Http\Controllers\Api\InventaireController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PersonnelController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\VenteRapideController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\StockController;
use Illuminate\Support\Facades\Route;

// ─── Auth Personnel ───────────────────────────────────────────────────────────
Route::prefix('personnel/auth')->group(function () {
    Route::middleware('throttle:5,1')->post('login', [PersonnelAuthController::class, 'login']);

    Route::middleware('auth:personnel')->group(function () {
        Route::get('me', [PersonnelAuthController::class, 'me']);
        Route::post('logout', [PersonnelAuthController::class, 'logout']);
    });
});

// ─── Auth Client ──────────────────────────────────────────────────────────────
Route::prefix('client/auth')->group(function () {
    Route::middleware('throttle:5,1')->post('login', [ClientAuthController::class, 'login']);

    Route::middleware('auth:client')->group(function () {
        Route::get('me', [ClientAuthController::class, 'me']);
        Route::post('logout', [ClientAuthController::class, 'logout']);
    });
});

// ─── Routes Personnel ─────────────────────────────────────────────────────────
Route::middleware(['auth:personnel'])->group(function () {

    // Catégories
    Route::get('categories', [CategorieController::class, 'index']);
    Route::post('categories', [CategorieController::class, 'store']);
    Route::get('categories/{categorie}', [CategorieController::class, 'show']);
    Route::put('categories/{categorie}', [CategorieController::class, 'update']);
    Route::delete('categories/{categorie}', [CategorieController::class, 'destroy']);

    // Produits
    Route::get('produits', [ProduitController::class, 'index']);
    Route::post('produits', [ProduitController::class, 'store']);
    Route::get('produits/{produit}', [ProduitController::class, 'show']);
    Route::put('produits/{produit}', [ProduitController::class, 'update']);
    Route::delete('produits/{produit}', [ProduitController::class, 'destroy']);
    Route::post('produits/{produit}/images', [ProduitController::class, 'uploadImage']);
    Route::delete('produits/{produit}/images/{mediaId}', [ProduitController::class, 'deleteImage']);

    // Clients
    Route::get('clients', [ClientController::class, 'index']);
    Route::post('clients', [ClientController::class, 'store']);
    Route::get('clients/{client}', [ClientController::class, 'show']);
    Route::put('clients/{client}', [ClientController::class, 'update']);
    Route::delete('clients/{client}', [ClientController::class, 'destroy']);

    // Fournisseurs
    Route::get('fournisseurs', [FournisseurController::class, 'index']);
    Route::post('fournisseurs', [FournisseurController::class, 'store']);
    Route::get('fournisseurs/{fournisseur}', [FournisseurController::class, 'show']);
    Route::put('fournisseurs/{fournisseur}', [FournisseurController::class, 'update']);
    Route::delete('fournisseurs/{fournisseur}', [FournisseurController::class, 'destroy']);

    // Commandes (personnel)
    Route::get('commandes', [CommandeController::class, 'index']);
    Route::post('commandes', [CommandeController::class, 'store']);
    Route::get('commandes/{commande}', [CommandeController::class, 'show']);
    Route::put('commandes/{commande}', [CommandeController::class, 'update']);
    Route::patch('commandes/{commande}/confirmer', [CommandeController::class, 'confirmer']);
    Route::patch('commandes/{commande}/en-preparation', [CommandeController::class, 'mettreEnPreparation']);
    Route::patch('commandes/{commande}/en-livraison', [CommandeController::class, 'mettreEnLivraison']);
    Route::patch('commandes/{commande}/livree', [CommandeController::class, 'marquerLivree']);
    Route::patch('commandes/{commande}/cloturer', [CommandeController::class, 'cloturer']);
    Route::patch('commandes/{commande}/annuler', [CommandeController::class, 'annuler']);

    // Paiements
    Route::get('paiements', [PaiementController::class, 'index']);
    Route::post('paiements', [PaiementController::class, 'store']);
    Route::get('paiements/{paiement}', [PaiementController::class, 'show']);
    Route::patch('paiements/{paiement}/valider', [PaiementController::class, 'valider']);
    Route::patch('paiements/{paiement}/rejeter', [PaiementController::class, 'rejeter']);

    // Stock
    Route::get('stock/mouvements', [StockController::class, 'mouvements']);
    Route::get('stock/alertes', [StockController::class, 'alertes']);
    Route::post('stock/ajuster', [StockController::class, 'ajuster']);

    // Approvisionnements
    Route::get('approvisionnements', [ApprovisionnementController::class, 'index']);
    Route::post('approvisionnements', [ApprovisionnementController::class, 'store']);
    Route::get('approvisionnements/{approvisionnement}', [ApprovisionnementController::class, 'show']);
    Route::patch('approvisionnements/{approvisionnement}/commander', [ApprovisionnementController::class, 'commander']);
    Route::patch('approvisionnements/{approvisionnement}/en-transit', [ApprovisionnementController::class, 'mettreEnTransit']);
    Route::patch('approvisionnements/{approvisionnement}/receptionner', [ApprovisionnementController::class, 'receptionner']);
    Route::patch('approvisionnements/{approvisionnement}/valider', [ApprovisionnementController::class, 'valider']);

    // Inventaires
    Route::get('inventaires', [InventaireController::class, 'index']);
    Route::post('inventaires', [InventaireController::class, 'store']);
    Route::get('inventaires/{inventaire}', [InventaireController::class, 'show']);
    Route::patch('inventaires/{inventaire}/valider', [InventaireController::class, 'valider']);

    // Personnel (admin)
    Route::get('personnel', [PersonnelController::class, 'index']);
    Route::post('personnel', [PersonnelController::class, 'store']);
    Route::get('personnel/{personnel}', [PersonnelController::class, 'show']);
    Route::put('personnel/{personnel}', [PersonnelController::class, 'update']);
    Route::delete('personnel/{personnel}', [PersonnelController::class, 'destroy']);

    // Caisse / Vente rapide
    Route::get('caisse/chercher',    [VenteRapideController::class, 'chercher']);
    Route::get('caisse/suggestions', [VenteRapideController::class, 'suggestions']);
    Route::post('caisse/vendre',     [VenteRapideController::class, 'vendre']);

    // Audit
    Route::get('audit-logs', [AuditLogController::class, 'index']);

    // Rapports
    Route::get('rapports/tableau-de-bord', [RapportController::class, 'tableauDeBord']);
    Route::get('rapports/chiffre-affaires', [RapportController::class, 'chiffreAffaires']);
    Route::get('rapports/top-produits', [RapportController::class, 'topProduits']);
    Route::get('rapports/mouvements-stock', [RapportController::class, 'mouvementsStock']);
});

// ─── Routes Client (portail) ──────────────────────────────────────────────────
Route::middleware(['auth:client'])->prefix('portail')->group(function () {

    Route::get('commandes', [CommandeController::class, 'index']);
    Route::post('commandes', [CommandeController::class, 'store']);
    Route::get('commandes/{commande}', [CommandeController::class, 'show']);
    Route::patch('commandes/{commande}/annuler', [CommandeController::class, 'annuler']);

    Route::get('categories', [CategorieController::class, 'index']);

    Route::get('produits', [ProduitController::class, 'index']);
    Route::get('produits/{produit}', [ProduitController::class, 'show']);
});
