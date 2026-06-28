<?php

namespace App\Http\Requests\Fournisseur;

use Illuminate\Foundation\Http\FormRequest;

class StoreFournisseurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'       => ['required', 'string', 'max:150'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'email'     => ['nullable', 'email', 'max:255'],
            'adresse'   => ['nullable', 'string'],
            'ville'     => ['nullable', 'string', 'max:100'],
            'ice'       => ['nullable', 'string', 'max:20'],
            'actif'     => ['nullable', 'boolean'],
        ];
    }
}
