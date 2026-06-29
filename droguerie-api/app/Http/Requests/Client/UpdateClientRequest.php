<?php

namespace App\Http\Requests\Client;

use App\Enums\TypeClient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id;

        return [
            'nom'           => ['sometimes', 'string', 'max:100'],
            'prenom'        => ['nullable', 'string', 'max:100'],
            'telephone'     => ['nullable', 'string', 'max:20',
                                Rule::unique('clients', 'telephone')->ignore($clientId)],
            'email'         => ['nullable', 'email', 'max:255',
                                Rule::unique('clients', 'email')->ignore($clientId),
                                Rule::unique('client_accounts', 'email')->ignore(
                                    $this->route('client')?->account?->id
                                )],
            'ice'           => ['nullable', 'string', 'max:20',
                                Rule::unique('clients', 'ice')->ignore($clientId)],
            'adresse'       => ['nullable', 'string'],
            'ville'         => ['nullable', 'string', 'max:100'],
            'type_client'   => ['sometimes', new Enum(TypeClient::class)],
            'credit_limite' => ['nullable', 'numeric', 'min:0'],
            'actif'         => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre client.',
            'email.unique'     => 'Cet email est déjà utilisé par un autre client.',
            'ice.unique'       => 'Ce numéro ICE est déjà utilisé par un autre client.',
        ];
    }
}
