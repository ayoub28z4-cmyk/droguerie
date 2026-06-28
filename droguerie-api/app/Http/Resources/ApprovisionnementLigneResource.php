<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovisionnementLigneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'produit_id'           => $this->produit_id,
            'produit'              => new ProduitResource($this->whenLoaded('produit')),
            'quantite_commandee'   => $this->quantite_commandee,
            'quantite_recue'       => $this->quantite_recue,
            'prix_achat_unitaire'  => $this->prix_achat_unitaire,
            'total_ht'             => $this->total_ht,
        ];
    }
}
