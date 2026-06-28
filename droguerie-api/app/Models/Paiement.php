<?php

namespace App\Models;

use App\Enums\ModePaiement;
use App\Enums\StatutPaiement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'commande_id', 'client_id', 'personnel_id',
        'montant', 'mode_paiement', 'statut', 'reference', 'notes', 'paid_at',
    ];

    protected $casts = [
        'montant'       => 'decimal:2',
        'mode_paiement' => ModePaiement::class,
        'statut'        => StatutPaiement::class,
        'paid_at'       => 'datetime',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function scopeValide(Builder $q): Builder
    {
        return $q->where('statut', StatutPaiement::Valide);
    }
}
