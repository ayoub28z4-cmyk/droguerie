<?php

namespace App\Enums;

enum StatutProduit: string
{
    case Actif   = 'actif';
    case Rupture = 'rupture';
    case Archive = 'archive';

    public function label(): string
    {
        return match($this) {
            self::Actif   => 'Actif',
            self::Rupture => 'Rupture de stock',
            self::Archive => 'Archivé',
        };
    }
}
