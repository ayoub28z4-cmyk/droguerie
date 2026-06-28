<?php

namespace App\Models;

use App\Enums\TypeMouvement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMouvement extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'produit_id', 'personnel_id', 'commande_id',
        'approvisionnement_id', 'fournisseur_id',
        'type_mouvement', 'quantite', 'stock_avant', 'stock_apres',
        'prix_unitaire', 'motif', 'created_at',
    ];

    protected $casts = [
        'type_mouvement' => TypeMouvement::class,
        'quantite'       => 'decimal:3',
        'stock_avant'    => 'decimal:3',
        'stock_apres'    => 'decimal:3',
        'prix_unitaire'  => 'decimal:2',
        'created_at'     => 'datetime',
    ];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function approvisionnement(): BelongsTo
    {
        return $this->belongsTo(Approvisionnement::class);
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function scopeType(Builder $q, TypeMouvement $type): Builder
    {
        return $q->where('type_mouvement', $type);
    }
}
