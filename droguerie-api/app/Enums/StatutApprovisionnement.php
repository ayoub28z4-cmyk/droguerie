<?php

namespace App\Enums;

enum StatutApprovisionnement: string
{
    case Brouillon   = 'brouillon';
    case Commande    = 'commande';
    case EnTransit   = 'en_transit';
    case Receptionne = 'receptionne';
    case Valide      = 'valide';

    public function peutPasserA(self $nouveau): bool
    {
        return match($this) {
            self::Brouillon   => $nouveau === self::Commande,
            self::Commande    => $nouveau === self::EnTransit,
            self::EnTransit   => $nouveau === self::Receptionne,
            self::Receptionne => $nouveau === self::Valide,
            default           => false,
        };
    }

    public function label(): string
    {
        return match($this) {
            self::Brouillon   => 'Brouillon',
            self::Commande    => 'Commandé',
            self::EnTransit   => 'En transit',
            self::Receptionne => 'Réceptionné',
            self::Valide      => 'Validé',
        };
    }
}
