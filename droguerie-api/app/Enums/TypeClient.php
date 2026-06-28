<?php

namespace App\Enums;

enum TypeClient: string
{
    case Particulier   = 'particulier';
    case Professionnel = 'professionnel';
    case Entreprise    = 'entreprise';

    public function label(): string
    {
        return match($this) {
            self::Particulier   => 'Particulier',
            self::Professionnel => 'Professionnel',
            self::Entreprise    => 'Entreprise',
        };
    }
}
