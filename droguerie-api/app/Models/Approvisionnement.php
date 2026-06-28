<?php

namespace App\Models;

use App\Enums\StatutApprovisionnement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Approvisionnement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'fournisseur_id', 'personnel_id', 'numero_bl',
        'statut', 'date_reception', 'montant_total', 'notes',
    ];

    protected $casts = [
        'statut'         => StatutApprovisionnement::class,
        'date_reception' => 'date',
        'montant_total'  => 'decimal:2',
    ];

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(ApprovisionnementLigne::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(StockMouvement::class);
    }

    public function scopeStatut(Builder $q, StatutApprovisionnement $statut): Builder
    {
        return $q->where('statut', $statut);
    }
}
