<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProduitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'reference'      => $this->reference,
            'code_barre'     => $this->code_barre,
            'categorie_id'   => $this->categorie_id,
            'designation'    => $this->designation,
            'description'    => $this->description,
            'prix_achat'     => $this->prix_achat,
            'prix_vente_ht'  => $this->prix_vente_ht,
            'prix_vente_ttc' => $this->prix_vente_ttc,
            'tva'            => $this->tva,
            'unite'          => $this->unite,
            'stock_actuel'   => $this->stock_actuel,
            'stock_minimum'  => $this->stock_minimum,
            'stock_maximum'  => $this->stock_maximum,
            'statut'         => $this->statut?->value,
            'statut_label'   => $this->statut?->label(),
            'actif'          => $this->actif,
            'en_alerte'      => (float) $this->stock_actuel <= (float) $this->stock_minimum,
            'categorie'      => new CategorieResource($this->whenLoaded('categorie')),
            'fournisseur'    => new FournisseurResource($this->whenLoaded('fournisseur')),
            'images'         => $this->getMedia('images')->map(fn($m) => [
                'id'        => $m->id,
                'url'       => $m->getUrl(),
                'thumbnail' => $m->getUrl('thumbnail'),
                'medium'    => $m->getUrl('medium'),
            ]),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
