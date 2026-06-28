<?php

namespace App\Exceptions;

use Exception;

class CreditLimiteDepasseException extends Exception
{
    public function __construct(float $creditLimite, float $soldeActuel, float $montant)
    {
        $disponible = $creditLimite - $soldeActuel;
        parent::__construct(
            "Limite de crédit dépassée. Disponible : {$disponible} DH, Montant demandé : {$montant} DH."
        );
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
