<?php

namespace App\Http\Requests\Personnel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $personnelId = $this->route('personnel')?->id;

        return [
            'nom'       => ['sometimes', 'string', 'max:100'],
            'prenom'    => ['sometimes', 'string', 'max:100'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'email'     => ['sometimes', 'email', Rule::unique('personnel', 'email')->ignore($personnelId)],
            'password'  => ['nullable', 'string', 'min:8', 'confirmed'],
            'roles'     => ['nullable', 'array'],
            'roles.*'   => ['string', 'exists:roles,name'],
            'actif'     => ['sometimes', 'boolean'],
        ];
    }
}
