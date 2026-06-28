<?php

namespace App\Http\Requests\Commande;

use App\Enums\CanalCommande;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreCommandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (auth('client')->check()) {
            $this->merge(['client_id' => auth('client')->user()->client_id]);
        }
    }

    public function rules(): array
    {
        return [
            'client_id'              => ['required', 'exists:clients,id'],
            'canal'                  => ['nullable', new Enum(CanalCommande::class)],
            'date_livraison'         => ['nullable', 'date', 'after_or_equal:today'],
            'notes'                  => ['nullable', 'string'],
            'lignes'                 => ['required', 'array', 'min:1'],
            'lignes.*.produit_id'    => ['required', 'exists:produits,id'],
            'lignes.*.quantite'      => ['required', 'numeric', 'min:0.001'],
            'lignes.*.prix_unitaire_ht' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
