<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovisionnementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'statut'         => $this->statut?->value,
            'statut_label'   => $this->statut?->label(),
            'numero_bl'      => $this->numero_bl,
            'date_reception' => $this->date_reception?->toDateString(),
            'montant_total'  => $this->montant_total,
            'notes'          => $this->notes,
            'fournisseur'    => new FournisseurResource($this->whenLoaded('fournisseur')),
            'personnel'      => new PersonnelResource($this->whenLoaded('personnel')),
            'lignes'         => ApprovisionnementLigneResource::collection($this->whenLoaded('lignes')),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
