<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'commande_id'      => $this->commande_id,
            'commande'         => $this->whenLoaded('commande', fn() => [
                'id'     => $this->commande->id,
                'numero' => $this->commande->numero,
            ]),
            'montant'          => $this->montant,
            'mode_paiement'    => $this->mode_paiement?->value,
            'mode_label'       => $this->mode_paiement?->label(),
            'statut'           => $this->statut?->value,
            'statut_label'     => $this->statut?->label(),
            'reference'        => $this->reference,
            'notes'            => $this->notes,
            'paid_at'          => $this->paid_at?->toISOString(),
            'personnel'        => new PersonnelResource($this->whenLoaded('personnel')),
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
