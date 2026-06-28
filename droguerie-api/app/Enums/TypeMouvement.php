<?php

namespace App\Enums;

enum TypeMouvement: string
{
    case Entree     = 'entree';
    case Sortie     = 'sortie';
    case Retour     = 'retour';
    case Ajustement = 'ajustement';
    case Inventaire = 'inventaire';

    public function label(): string
    {
        return match($this) {
            self::Entree     => 'Entrée',
            self::Sortie     => 'Sortie',
            self::Retour     => 'Retour',
            self::Ajustement => 'Ajustement',
            self::Inventaire => 'Inventaire',
        };
    }

    public function estEntree(): bool
    {
        return in_array($this, [self::Entree, self::Retour]);
    }
}
