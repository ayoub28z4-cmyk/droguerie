<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FournisseurResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'nom'       => $this->nom,
            'telephone' => $this->telephone,
            'email'     => $this->email,
            'adresse'   => $this->adresse,
            'ville'     => $this->ville,
            'ice'       => $this->ice,
            'solde_du'  => $this->solde_du,
            'actif'     => $this->actif,
            'created_at'=> $this->created_at?->toISOString(),
        ];
    }
}
