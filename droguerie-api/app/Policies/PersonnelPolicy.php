<?php

namespace App\Policies;

use App\Models\Personnel;

class PersonnelPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('personnel.view');
    }

    public function view(Personnel $acteur, Personnel $cible): bool
    {
        return $acteur->hasPermissionTo('personnel.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('personnel.create');
    }

    public function update(Personnel $acteur, Personnel $cible): bool
    {
        return $acteur->hasPermissionTo('personnel.update');
    }

    public function delete(Personnel $acteur, Personnel $cible): bool
    {
        return $acteur->hasPermissionTo('personnel.delete') && $acteur->id !== $cible->id;
    }
}
