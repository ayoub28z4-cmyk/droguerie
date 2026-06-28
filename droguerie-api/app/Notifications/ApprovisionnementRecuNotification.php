<?php

namespace App\Notifications;

use App\Models\Approvisionnement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ApprovisionnementRecuNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Approvisionnement $approvisionnement) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'                  => 'approvisionnement_recu',
            'approvisionnement_id'  => $this->approvisionnement->id,
            'fournisseur'           => $this->approvisionnement->fournisseur?->nom,
            'numero_bl'             => $this->approvisionnement->numero_bl,
            'montant_total'         => $this->approvisionnement->montant_total,
            'message'               => "Approvisionnement de {$this->approvisionnement->fournisseur?->nom} reçu et validé.",
        ];
    }
}
