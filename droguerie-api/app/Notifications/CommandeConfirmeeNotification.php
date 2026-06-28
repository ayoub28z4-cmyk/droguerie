<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommandeConfirmeeNotification extends Notification implements ShouldQueue
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
            ->subject("Votre commande {$this->commande->numero} est confirmée")
            ->greeting("Bonjour {$notifiable->client->nom_complet},")
            ->line("Votre commande **{$this->commande->numero}** a bien été confirmée.")
            ->line("Montant TTC : {$this->commande->montant_ttc} DH")
            ->action('Voir la commande', rtrim(config('app.frontend_url', config('app.url')), '/') . "/commandes/{$this->commande->id}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'commande_confirmee',
            'commande_id'  => $this->commande->id,
            'numero'       => $this->commande->numero,
            'montant_ttc'  => $this->commande->montant_ttc,
            'message'      => "Commande {$this->commande->numero} confirmée.",
        ];
    }
}
