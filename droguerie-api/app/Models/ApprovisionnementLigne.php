<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovisionnementLigne extends Model
{
    use HasFactory;

    protected $fillable = [
        'approvisionnement_id', 'produit_id',
        'quantite_commandee', 'quantite_recue',
        'prix_achat_unitaire', 'total_ht',
    ];

    protected $casts = [
        'quantite_commandee'  => 'decimal:3',
        'quantite_recue'      => 'decimal:3',
        'prix_achat_unitaire' => 'decimal:2',
        'total_ht'            => 'decimal:2',
    ];

    public function approvisionnement(): BelongsTo
    {
        return $this->belongsTo(Approvisionnement::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }
}
