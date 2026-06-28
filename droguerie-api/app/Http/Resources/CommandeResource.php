<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'numero'         => $this->numero,
            'statut'         => $this->statut?->value,
            'statut_label'   => $this->statut?->label(),
            'canal'          => $this->canal?->value,
            'canal_label'    => $this->canal?->label(),
            'montant_ht'     => $this->montant_ht,
            'tva'            => $this->tva,
            'montant_ttc'    => $this->montant_ttc,
            'montant_paye'   => $this->montant_paye,
            'reste_a_payer'  => $this->reste_a_payer,
            'est_payee'      => $this->estPayee(),
            'date_livraison' => $this->date_livraison?->toDateString(),
            'notes'          => $this->notes,
            'client'         => new ClientResource($this->whenLoaded('client')),
            'personnel'      => new PersonnelResource($this->whenLoaded('personnel')),
            'lignes'         => CommandeLigneResource::collection($this->whenLoaded('lignes')),
            'paiements'      => PaiementResource::collection($this->whenLoaded('paiements')),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
