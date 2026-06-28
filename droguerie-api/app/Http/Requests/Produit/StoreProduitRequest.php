<?php

namespace App\Http\Requests\Produit;

use App\Enums\StatutProduit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference'      => ['required', 'string', 'max:50', 'unique:produits,reference'],
            'designation'    => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'prix_achat'     => ['required', 'numeric', 'min:0'],
            'prix_vente_ht'  => ['required', 'numeric', 'min:0'],
            'tva'            => ['required', 'numeric', 'min:0', 'max:100'],
            'unite'          => ['required', 'string', 'max:20'],
            'stock_actuel'   => ['nullable', 'numeric', 'min:0'],
            'stock_minimum'  => ['nullable', 'numeric', 'min:0'],
            'stock_maximum'  => ['nullable', 'numeric', 'min:0'],
            'categorie_id'   => ['required', 'exists:categories,id'],
            'fournisseur_id' => ['nullable', 'exists:fournisseurs,id'],
            'statut'         => ['nullable', new Enum(StatutProduit::class)],
            'actif'          => ['nullable', 'boolean'],
        ];
    }
}
