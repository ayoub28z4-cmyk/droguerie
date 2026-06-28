<?php

namespace App\Policies;

use App\Models\ClientAccount;
use App\Models\Personnel;
use App\Models\Produit;

class ProduitPolicy
{
    /** Les clients du portail peuvent toujours consulter les produits actifs. */
    public function before(mixed $user, string $ability): ?bool
    {
        if ($user instanceof ClientAccount && in_array($ability, ['viewAny', 'view'])) {
            return true;
        }
        return null;
    }

    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('produits.view');
    }

    public function view(Personnel $personnel, Produit $_produit): bool
    {
        return $personnel->hasPermissionTo('produits.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('produits.create');
    }

    public function update(Personnel $personnel, Produit $_produit): bool
    {
        return $personnel->hasPermissionTo('produits.update');
    }

    public function delete(Personnel $personnel, Produit $_produit): bool
    {
        return $personnel->hasPermissionTo('produits.delete');
    }

    public function uploadMedia(Personnel $personnel, Produit $_produit): bool
    {
        return $personnel->hasPermissionTo('produits.update');
    }
}
