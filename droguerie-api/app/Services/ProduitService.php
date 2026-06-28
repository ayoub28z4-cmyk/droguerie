<?php

namespace App\Services;

use App\Enums\StatutProduit;
use App\Models\Produit;
use App\Services\AuditService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProduitService
{
    public function creer(array $data): Produit
    {
        return DB::transaction(function () use ($data) {
            $data['statut'] = $data['statut'] ?? StatutProduit::Actif;
            $produit = Produit::create($data);
            AuditService::log('produit_cree', "Produit \"{$produit->designation}\" créé (réf. {$produit->reference})", $produit);
            return $produit;
        });
    }

    public function modifier(Produit $produit, array $data): Produit
    {
        return DB::transaction(function () use ($produit, $data) {
            $produit->update($data);
            AuditService::log('produit_modifie', "Produit \"{$produit->designation}\" modifié", $produit);
            return $produit->fresh();
        });
    }

    public function ajouterImage(Produit $produit, UploadedFile $fichier): void
    {
        $produit->addMedia($fichier)
                ->toMediaCollection('images');
    }

    public function supprimerImage(Produit $produit, int $mediaId): void
    {
        $media = $produit->getMedia('images')->find($mediaId);
        $media?->delete();
    }

    public function supprimer(Produit $produit): void
    {
        AuditService::log('produit_supprime', "Produit \"{$produit->designation}\" supprimé (réf. {$produit->reference})", $produit);
        $produit->delete();
    }
}
