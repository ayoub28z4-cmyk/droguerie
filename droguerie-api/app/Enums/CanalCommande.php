<?php

namespace App\Enums;

enum CanalCommande: string
{
    case Magasin = 'magasin';
    case Portail = 'portail';

    public function label(): string
    {
        return match($this) {
            self::Magasin => 'Magasin',
            self::Portail => 'Portail client',
        };
    }
}
