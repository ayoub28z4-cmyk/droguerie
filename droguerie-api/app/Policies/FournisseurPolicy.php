<?php

namespace App\Policies;

use App\Models\Fournisseur;
use App\Models\Personnel;

class FournisseurPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('fournisseurs.view');
    }

    public function view(Personnel $personnel, Fournisseur $fournisseur): bool
    {
        return $personnel->hasPermissionTo('fournisseurs.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('fournisseurs.create');
    }

    public function update(Personnel $personnel, Fournisseur $fournisseur): bool
    {
        return $personnel->hasPermissionTo('fournisseurs.update');
    }

    public function delete(Personnel $personnel, Fournisseur $fournisseur): bool
    {
        return $personnel->hasRole('admin');
    }
}
