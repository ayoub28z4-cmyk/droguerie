<?php

namespace App\Exceptions;

use App\Models\Produit;
use Exception;

class StockInsuffisantException extends Exception
{
    public function __construct(private readonly Produit $produit)
    {
        parent::__construct(
            "Stock insuffisant pour le produit {$produit->designation}. "
            . "Stock actuel : {$produit->stock_actuel} {$produit->unite}."
        );
    }

    public function getProduit(): Produit
    {
        return $this->produit;
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
