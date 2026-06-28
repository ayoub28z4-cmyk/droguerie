<?php

namespace App\Policies;

use App\Enums\StatutCommande;
use App\Models\ClientAccount;
use App\Models\Commande;
use App\Models\Personnel;

class CommandePolicy
{
    public function viewAny(Personnel|ClientAccount $user): bool
    {
        if ($user instanceof ClientAccount) {
            return true;
        }
        return $user->hasPermissionTo('commandes.view');
    }

    public function view(Personnel|ClientAccount $user, Commande $commande): bool
    {
        if ($user instanceof ClientAccount) {
            return $commande->client_id === $user->client_id;
        }
        return $user->hasPermissionTo('commandes.view');
    }

    public function create(Personnel|ClientAccount $user): bool
    {
        if ($user instanceof ClientAccount) {
            return true;
        }
        return $user->hasPermissionTo('commandes.create');
    }

    public function update(Personnel $personnel, Commande $commande): bool
    {
        return $personnel->hasPermissionTo('commandes.update');
    }

    public function annuler(Personnel|ClientAccount $user, Commande $commande): bool
    {
        if ($user instanceof ClientAccount) {
            return $commande->client_id === $user->client_id
                && in_array($commande->statut, [StatutCommande::EnAttente, StatutCommande::Confirmee]);
        }
        return $user->hasPermissionTo('commandes.annuler');
    }
}
