<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonnelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'nom'         => $this->nom,
            'prenom'      => $this->prenom,
            'nom_complet' => $this->nom_complet,
            'telephone'   => $this->telephone,
            'email'       => $this->email,
            'actif'       => $this->actif,
            'roles'       => $this->whenLoaded('roles', fn() => $this->roles->pluck('name')),
            'permissions' => $this->when(
                $request->user()?->id === $this->id,
                fn() => $this->getAllPermissions()->pluck('name')
            ),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}
