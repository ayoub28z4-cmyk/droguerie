<?php

namespace App\Enums;

enum StatutPaiement: string
{
    case EnAttente = 'en_attente';
    case Valide    = 'valide';
    case Rejete    = 'rejete';
    case Rembourse = 'rembourse';

    public function label(): string
    {
        return match($this) {
            self::EnAttente => 'En attente',
            self::Valide    => 'Validé',
            self::Rejete    => 'Rejeté',
            self::Rembourse => 'Remboursé',
        };
    }
}
