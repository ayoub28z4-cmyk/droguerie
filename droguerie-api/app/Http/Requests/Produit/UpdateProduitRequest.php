<?php

namespace App\Http\Requests\Produit;

use App\Enums\StatutProduit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $produitId = $this->route('produit')?->id;

        return [
            'reference'      => ['sometimes', 'string', 'max:50', Rule::unique('produits', 'reference')->ignore($produitId)],
            'code_barre'     => ['nullable', 'string', 'max:50'],
            'designation'    => ['sometimes', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'prix_achat'     => ['sometimes', 'numeric', 'min:0'],
            'prix_vente_ht'  => ['sometimes', 'numeric', 'min:0'],
            'tva'            => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'unite'          => ['sometimes', 'string', 'max:20'],
            'stock_minimum'  => ['sometimes', 'numeric', 'min:0'],
            'stock_maximum'  => ['nullable', 'numeric', 'min:0'],
            'categorie_id'   => ['sometimes', 'exists:categories,id'],
            'fournisseur_id' => ['nullable', 'exists:fournisseurs,id'],
            'statut'         => ['sometimes', new Enum(StatutProduit::class)],
            'actif'          => ['sometimes', 'boolean'],
        ];
    }
}
