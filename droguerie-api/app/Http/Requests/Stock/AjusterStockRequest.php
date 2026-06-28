<?php

namespace App\Http\Requests\Stock;

use App\Enums\TypeMouvement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AjusterStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'produit_id'     => ['required', 'exists:produits,id'],
            'quantite'       => ['required', 'numeric'],
            'type_mouvement' => ['required', new Enum(TypeMouvement::class)],
            'motif'          => ['required', 'string', 'max:500'],
            'prix_unitaire'  => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
