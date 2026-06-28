<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandeLigneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'produit_id'       => $this->produit_id,
            'produit'          => new ProduitResource($this->whenLoaded('produit')),
            'quantite'         => $this->quantite,
            'prix_unitaire_ht' => $this->prix_unitaire_ht,
            'tva'              => $this->tva,
            'montant_ht'       => $this->total_ht,
            'montant_ttc'      => $this->total_ttc,
        ];
    }
}
