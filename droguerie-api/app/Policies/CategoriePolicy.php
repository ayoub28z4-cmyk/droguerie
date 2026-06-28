<?php

namespace App\Policies;

use App\Models\Personnel;

class CategoriePolicy
{
    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('produits.create');
    }

    public function update(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('produits.update');
    }

    public function delete(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('produits.delete');
    }
}
