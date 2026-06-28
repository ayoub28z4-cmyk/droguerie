<?php

namespace App\Http\Requests\Paiement;

use App\Enums\ModePaiement;
use App\Models\Commande;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commande_id'   => [
                'required',
                'exists:commandes,id',
                function ($attribute, $value, $fail) {
                    $commande = Commande::find($value);
                    if (! $commande) return;

                    // Fix 2 : interdire paiement sur commande annulée ou clôturée
                    if (in_array($commande->statut->value, ['annulee', 'cloturee'])) {
                        $fail("Impossible d'enregistrer un paiement sur une commande {$commande->statut->label()}.");
                    }
                },
            ],
            'montant'       => [
                'required',
                'numeric',
                'min:0.01',
                function ($attribute, $value, $fail) {
                    $commande = Commande::find($this->input('commande_id'));
                    if (! $commande) return;

                    // Fix 4 : bloquer le surpaiement
                    if ((float) $value > (float) $commande->reste_a_payer) {
                        $resteFormate = number_format((float) $commande->reste_a_payer, 2, ',', ' ');
                        $fail("Le montant dépasse le reste à payer ({$resteFormate} MAD).");
                    }
                },
            ],
            'mode_paiement' => ['required', new Enum(ModePaiement::class)],
            'reference'     => ['nullable', 'string', 'max:100'],
            'notes'         => ['nullable', 'string'],
        ];
    }
}
