<?php

namespace App\Models;

use App\Enums\CanalCommande;
use App\Enums\StatutCommande;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commande extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero', 'client_id', 'personnel_id', 'statut', 'canal',
        'montant_ht', 'tva', 'montant_ttc', 'montant_paye', 'reste_a_payer',
        'date_livraison', 'notes',
    ];

    protected $casts = [
        'statut'        => StatutCommande::class,
        'canal'         => CanalCommande::class,
        'montant_ht'    => 'decimal:2',
        'tva'           => 'decimal:2',
        'montant_ttc'   => 'decimal:2',
        'montant_paye'  => 'decimal:2',
        'reste_a_payer' => 'decimal:2',
        'date_livraison'=> 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(CommandeLigne::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(StockMouvement::class);
    }

    public function scopeStatut(Builder $q, StatutCommande $statut): Builder
    {
        return $q->where('statut', $statut);
    }

    public function scopeCanal(Builder $q, CanalCommande $canal): Builder
    {
        return $q->where('canal', $canal);
    }

    public function estPayee(): bool
    {
        return (float) $this->reste_a_payer <= 0;
    }
}
