<?php

namespace App\Http\Requests\Approvisionnement;

use Illuminate\Foundation\Http\FormRequest;

class ReceptionnerApprovisionnementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_reception'                  => ['required', 'date'],
            'notes'                           => ['nullable', 'string'],
            'lignes'                          => ['required', 'array', 'min:1'],
            'lignes.*.id'                     => ['required', 'exists:approvisionnement_lignes,id'],
            'lignes.*.quantite_recue'         => ['required', 'numeric', 'min:0'],
            'lignes.*.prix_achat_unitaire'    => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
