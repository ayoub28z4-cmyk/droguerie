<?php

namespace App\Policies;

use App\Models\Personnel;

class RapportPolicy
{
    public function view(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('rapports.view');
    }
}
