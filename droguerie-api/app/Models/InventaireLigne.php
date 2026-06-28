<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventaireLigne extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventaire_id', 'produit_id',
        'stock_theorique', 'stock_reel', 'motif_ecart',
    ];

    // ecart est une colonne générée (storedAs) — lecture seule, non assignable
    protected $casts = [
        'stock_theorique' => 'decimal:3',
        'stock_reel'      => 'decimal:3',
        'ecart'           => 'decimal:3',
    ];

    public function inventaire(): BelongsTo
    {
        return $this->belongsTo(Inventaire::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }
}
