<?php

namespace App\Http\Requests\Auth;

use App\Enums\TypeClient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class RegisterClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'         => ['required', 'string', 'max:100'],
            'prenom'      => ['nullable', 'string', 'max:100'],
            'telephone'   => ['required', 'string', 'max:20', 'unique:clients,telephone'],
            'email'       => ['required', 'email', 'max:255', 'unique:clients,email', 'unique:client_accounts,email'],
            'password'    => ['required', Password::min(8)->letters()->numbers(), 'confirmed'],
            'adresse'     => ['nullable', 'string'],
            'ville'       => ['nullable', 'string', 'max:100'],
            'ice'         => ['nullable', 'string', 'max:20', 'unique:clients,ice'],
            'type_client' => ['required', new Enum(TypeClient::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required'       => 'Le nom est obligatoire.',
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'telephone.unique'   => 'Ce numéro de téléphone est déjà enregistré.',
            'email.required'     => 'L\'email est obligatoire.',
            'email.unique'       => 'Cet email est déjà utilisé.',
            'ice.unique'         => 'Ce numéro ICE est déjà enregistré.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
