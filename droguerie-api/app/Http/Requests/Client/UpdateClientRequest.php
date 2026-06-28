<?php

namespace App\Http\Requests\Client;

use App\Enums\TypeClient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'           => ['sometimes', 'string', 'max:100'],
            'prenom'        => ['nullable', 'string', 'max:100'],
            'telephone'     => ['nullable', 'string', 'max:20'],
            'email'         => ['nullable', 'email', 'max:255'],
            'adresse'       => ['nullable', 'string'],
            'ville'         => ['nullable', 'string', 'max:100'],
            'ice'           => ['nullable', 'string', 'max:20'],
            'type_client'   => ['sometimes', new Enum(TypeClient::class)],
            'credit_limite' => ['nullable', 'numeric', 'min:0'],
            'actif'         => ['sometimes', 'boolean'],
        ];
    }
}
