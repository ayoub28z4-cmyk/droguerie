<?php

namespace App\Enums;

enum ModePaiement: string
{
    case Especes  = 'especes';
    case Cheque   = 'cheque';
    case Virement = 'virement';
    case Credit   = 'credit';

    public function label(): string
    {
        return match($this) {
            self::Especes  => 'Espèces',
            self::Cheque   => 'Chèque',
            self::Virement => 'Virement bancaire',
            self::Credit   => 'Crédit',
        };
    }
}
