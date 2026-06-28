<?php

namespace App\Enums;

enum StatutCommande: string
{
    case EnAttente     = 'en_attente';
    case Confirmee     = 'confirmee';
    case EnPreparation = 'en_preparation';
    case EnLivraison   = 'en_livraison';
    case Livree        = 'livree';
    case Cloturee      = 'cloturee';
    case Annulee       = 'annulee';

    public function peutPasserA(self $nouveau): bool
    {
        return match($this) {
            self::EnAttente     => in_array($nouveau, [self::Confirmee, self::Annulee]),
            self::Confirmee     => in_array($nouveau, [self::EnPreparation, self::Annulee]),
            self::EnPreparation => $nouveau === self::EnLivraison,
            self::EnLivraison   => $nouveau === self::Livree,
            self::Livree        => $nouveau === self::Cloturee,
            default             => false,
        };
    }

    public function label(): string
    {
        return match($this) {
            self::EnAttente     => 'En attente',
            self::Confirmee     => 'Confirmée',
            self::EnPreparation => 'En préparation',
            self::EnLivraison   => 'En livraison',
            self::Livree        => 'Livrée',
            self::Cloturee      => 'Clôturée',
            self::Annulee       => 'Annulée',
        };
    }
}
