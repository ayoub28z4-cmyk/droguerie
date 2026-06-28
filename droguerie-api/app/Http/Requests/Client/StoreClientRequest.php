<?php

namespace App\Http\Requests\Client;

use App\Enums\TypeClient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'                   => ['required', 'string', 'max:100'],
            'prenom'                => ['nullable', 'string', 'max:100'],
            'telephone'             => ['nullable', 'string', 'max:20'],
            'email'                 => ['nullable', 'email', 'max:255', 'unique:client_accounts,email'],
            'adresse'               => ['nullable', 'string'],
            'ville'                 => ['nullable', 'string', 'max:100'],
            'ice'                   => ['nullable', 'string', 'max:20'],
            'type_client'           => ['required', new Enum(TypeClient::class)],
            'credit_limite'         => ['nullable', 'numeric', 'min:0'],
            'actif'                 => ['nullable', 'boolean'],
            'password'              => ['nullable', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['nullable', 'string'],
        ];
    }
}
