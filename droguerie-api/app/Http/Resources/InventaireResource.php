<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'statut'         => $this->statut,
            'date_inventaire'=> $this->date_inventaire?->toDateString(),
            'notes'          => $this->notes,
            'validated_at'   => $this->validated_at?->toISOString(),
            'personnel'      => new PersonnelResource($this->whenLoaded('personnel')),
            'lignes'         => InventaireLigneResource::collection($this->whenLoaded('lignes')),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
