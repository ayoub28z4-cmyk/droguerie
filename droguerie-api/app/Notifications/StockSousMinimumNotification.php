<?php

namespace App\Notifications;

use App\Models\Produit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StockSousMinimumNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Produit $produit) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Alerte stock : {$this->produit->designation}")
            ->line("Le stock du produit **{$this->produit->designation}** ({$this->produit->reference}) est sous le seuil minimum.")
            ->line("Stock actuel : {$this->produit->stock_actuel} {$this->produit->unite}")
            ->line("Stock minimum : {$this->produit->stock_minimum} {$this->produit->unite}")
            ->action('Voir le produit', rtrim(config('app.frontend_url', config('app.url')), '/') . "/produits/{$this->produit->id}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'            => 'alerte_stock',
            'produit_id'      => $this->produit->id,
            'produit_ref'     => $this->produit->reference,
            'designation'     => $this->produit->designation,
            'stock_actuel'    => $this->produit->stock_actuel,
            'stock_minimum'   => $this->produit->stock_minimum,
            'unite'           => $this->produit->unite,
            'message'         => "Stock bas : {$this->produit->designation}",
        ];
    }
}
