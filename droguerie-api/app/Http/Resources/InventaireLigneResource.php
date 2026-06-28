<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventaireLigneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'produit_id'      => $this->produit_id,
            'produit'         => new ProduitResource($this->whenLoaded('produit')),
            'stock_theorique' => $this->stock_theorique,
            'stock_reel'      => $this->stock_reel,
            'ecart'           => $this->ecart,
            'motif_ecart'     => $this->motif_ecart,
        ];
    }
}
