<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\Personnel;

class ClientPolicy
{
    public function viewAny(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('clients.view');
    }

    public function view(Personnel $personnel, Client $client): bool
    {
        return $personnel->hasPermissionTo('clients.view');
    }

    public function create(Personnel $personnel): bool
    {
        return $personnel->hasPermissionTo('clients.create');
    }

    public function update(Personnel $personnel, Client $client): bool
    {
        return $personnel->hasPermissionTo('clients.update');
    }

    public function delete(Personnel $personnel, Client $client): bool
    {
        return $personnel->hasPermissionTo('clients.delete');
    }
}
