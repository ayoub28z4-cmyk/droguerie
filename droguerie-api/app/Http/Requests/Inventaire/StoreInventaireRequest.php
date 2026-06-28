<?php

namespace App\Http\Requests\Inventaire;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_inventaire'          => ['required', 'date'],
            'notes'                    => ['nullable', 'string'],
            'lignes'                   => ['required', 'array', 'min:1'],
            'lignes.*.produit_id'      => ['required', 'exists:produits,id', 'distinct'],
            'lignes.*.stock_reel'      => ['required', 'numeric', 'min:0'],
            'lignes.*.motif_ecart'     => ['nullable', 'string'],
        ];
    }
}
