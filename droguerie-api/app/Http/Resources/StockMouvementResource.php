<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMouvementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'type_mouvement' => $this->type_mouvement?->value,
            'type_label'     => $this->type_mouvement?->label(),
            'quantite'       => $this->quantite,
            'stock_avant'    => $this->stock_avant,
            'stock_apres'    => $this->stock_apres,
            'prix_unitaire'  => $this->prix_unitaire,
            'motif'          => $this->motif,
            'produit'        => new ProduitResource($this->whenLoaded('produit')),
            'personnel'      => new PersonnelResource($this->whenLoaded('personnel')),
            'commande_id'    => $this->commande_id,
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
