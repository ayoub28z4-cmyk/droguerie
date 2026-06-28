<?php

namespace App\Policies;

use App\Models\Inventaire;
use App\Models\Personnel;

class InventairePolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('inventaires.view');
    }

    public function view(Personnel $personnel, Inventaire $inventaire): bool
    {
        return $personnel->hasPermissionTo('inventaires.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('inventaires.create');
    }

    public function update(Personnel $personnel, Inventaire $inventaire): bool
    {
        return $personnel->hasPermissionTo('inventaires.create')
            && $inventaire->statut === 'brouillon';
    }

    public function valider(Personnel $personnel, Inventaire $inventaire): bool
    {
        return $personnel->hasPermissionTo('inventaires.valider');
    }
}
