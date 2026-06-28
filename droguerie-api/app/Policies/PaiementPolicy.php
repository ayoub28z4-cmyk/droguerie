<?php

namespace App\Policies;

use App\Models\Paiement;
use App\Models\Personnel;

class PaiementPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('paiements.view');
    }

    public function view(Personnel $personnel, Paiement $paiement): bool
    {
        return $personnel->hasPermissionTo('paiements.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('paiements.create');
    }

    public function valider(Personnel $personnel, Paiement $paiement): bool
    {
        return $personnel->hasPermissionTo('paiements.valider');
    }
}
