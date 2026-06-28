<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategorieResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nom'            => $this->nom,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'actif'          => $this->actif,
            'produits_count' => $this->whenCounted('produits'),
            'parent'         => new CategorieResource($this->whenLoaded('parent')),
            'enfants'        => CategorieResource::collection($this->whenLoaded('enfants')),
        ];
    }
}
