<?php

namespace App\Notifications;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PaiementRecuNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Paiement $paiement) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'paiement_recu',
            'paiement_id'  => $this->paiement->id,
            'commande_id'  => $this->paiement->commande_id,
            'montant'      => $this->paiement->montant,
            'mode'         => $this->paiement->mode_paiement?->label(),
            'message'      => "Paiement de {$this->paiement->montant} DH reçu.",
        ];
    }
}
