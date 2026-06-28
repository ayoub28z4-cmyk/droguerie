<?php

namespace App\Policies;

use App\Models\Approvisionnement;
use App\Models\Personnel;

class ApprovisionnementPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('approvisionnements.view');
    }

    public function view(Personnel $personnel, Approvisionnement $approvisionnement): bool
    {
        return $personnel->hasPermissionTo('approvisionnements.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('approvisionnements.create');
    }

    public function update(Personnel $personnel, Approvisionnement $approvisionnement): bool
    {
        return $personnel->hasPermissionTo('approvisionnements.create');
    }

    public function valider(Personnel $personnel, Approvisionnement $approvisionnement): bool
    {
        return $personnel->hasPermissionTo('approvisionnements.valider');
    }
}
