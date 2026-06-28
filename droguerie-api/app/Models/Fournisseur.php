<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fournisseur extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom', 'telephone', 'email', 'adresse', 'ville', 'ice', 'solde_du', 'actif',
    ];

    protected $casts = [
        'solde_du' => 'decimal:2',
        'actif'    => 'boolean',
    ];

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class);
    }

    public function approvisionnements(): HasMany
    {
        return $this->hasMany(Approvisionnement::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(StockMouvement::class);
    }

    public function scopeActif(Builder $q): Builder
    {
        return $q->where('actif', true);
    }
}
