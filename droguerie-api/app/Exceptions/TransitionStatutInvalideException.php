<?php

namespace App\Exceptions;

use Exception;

class TransitionStatutInvalideException extends Exception
{
    public function __construct(string $de, string $vers, string $entite = 'commande')
    {
        parent::__construct(
            "Transition invalide pour {$entite} : impossible de passer de '{$de}' à '{$vers}'."
        );
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
