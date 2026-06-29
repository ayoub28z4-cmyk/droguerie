<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'nom'                => $this->nom,
            'prenom'             => $this->prenom,
            'nom_complet'        => $this->nom_complet,
            'telephone'          => $this->telephone,
            'email'              => $this->email,
            'adresse'            => $this->adresse,
            'ville'              => $this->ville,
            'ice'                => $this->ice,
            'type_client'        => $this->type_client?->value,
            'type_client_label'  => $this->type_client?->label(),
            'credit_limite'      => $this->credit_limite,
            'credit_disponible'  => $this->credit_disponible,
            'solde_du'           => $this->solde_du,
            'actif'                    => $this->actif,
            'a_compte'                 => $this->account !== null,
            'statut_inscription'       => $this->statut_inscription?->value,
            'statut_inscription_label' => $this->statut_inscription?->label(),
            'motif_rejet'              => $this->motif_rejet,
            'created_at'               => $this->created_at?->toISOString(),
        ];
    }
}
