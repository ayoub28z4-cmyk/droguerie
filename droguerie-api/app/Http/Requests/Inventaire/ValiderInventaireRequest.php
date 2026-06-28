<?php

namespace App\Http\Requests\Inventaire;

use Illuminate\Foundation\Http\FormRequest;

class ValiderInventaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('personnel')?->hasPermissionTo('inventaires.valider') ?? false;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
