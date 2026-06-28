<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommandeAnnuleeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Commande $commande) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Votre commande {$this->commande->numero} a été annulée")
            ->greeting("Bonjour,")
            ->line("La commande **{$this->commande->numero}** a été annulée.")
            ->line("Si vous avez des questions, contactez notre service client.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'commande_annulee',
            'commande_id' => $this->commande->id,
            'numero'      => $this->commande->numero,
            'message'     => "Commande {$this->commande->numero} annulée.",
        ];
    }
}
