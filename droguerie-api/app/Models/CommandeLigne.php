<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommandeLigne extends Model
{
    use HasFactory;

    protected $fillable = [
        'commande_id', 'produit_id', 'quantite',
        'prix_unitaire_ht', 'tva', 'total_ht',
    ];

    protected $casts = [
        'quantite'         => 'decimal:3',
        'prix_unitaire_ht' => 'decimal:2',
        'tva'              => 'decimal:2',
        'total_ht'         => 'decimal:2',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function getTotalTtcAttribute(): float
    {
        return (float) $this->total_ht * (1 + (float) $this->tva / 100);
    }
}
