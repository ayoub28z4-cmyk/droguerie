<?php

namespace App\Policies;

use App\Models\Personnel;

class StockPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('stock.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('stock.create');
    }

    public function ajuster(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('stock.ajuster');
    }
}
