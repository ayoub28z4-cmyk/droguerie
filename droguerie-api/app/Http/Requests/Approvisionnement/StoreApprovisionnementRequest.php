<?php

namespace App\Http\Requests\Approvisionnement;

use Illuminate\Foundation\Http\FormRequest;

class StoreApprovisionnementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fournisseur_id'                    => ['required', 'exists:fournisseurs,id'],
            'numero_bl'                         => ['nullable', 'string', 'max:100'],
            'date_reception'                    => ['nullable', 'date'],
            'notes'                             => ['nullable', 'string'],
            'lignes'                            => ['required', 'array', 'min:1'],
            'lignes.*.produit_id'               => ['required', 'exists:produits,id'],
            'lignes.*.quantite_commandee'       => ['required', 'numeric', 'min:0.001'],
            'lignes.*.prix_achat_unitaire'      => ['required', 'numeric', 'min:0'],
        ];
    }
}
