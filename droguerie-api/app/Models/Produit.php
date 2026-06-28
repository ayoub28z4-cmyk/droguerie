<?php

namespace App\Models;

use App\Enums\StatutProduit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Produit extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'reference', 'code_barre', 'designation', 'description',
        'prix_achat', 'prix_vente_ht', 'tva',
        'unite', 'stock_actuel', 'stock_minimum', 'stock_maximum',
        'categorie_id', 'fournisseur_id', 'statut', 'actif',
    ];

    protected $casts = [
        'prix_achat'    => 'decimal:2',
        'prix_vente_ht' => 'decimal:2',
        'tva'           => 'decimal:2',
        'stock_actuel'  => 'decimal:3',
        'stock_minimum' => 'decimal:3',
        'stock_maximum' => 'decimal:3',
        'statut'        => StatutProduit::class,
        'actif'         => 'boolean',
    ];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(StockMouvement::class);
    }

    public function commandeLignes(): HasMany
    {
        return $this->hasMany(CommandeLigne::class);
    }

    public function approvisionnementLignes(): HasMany
    {
        return $this->hasMany(ApprovisionnementLigne::class);
    }

    public function inventaireLignes(): HasMany
    {
        return $this->hasMany(InventaireLigne::class);
    }

    public function scopeActif(Builder $q): Builder
    {
        return $q->where('actif', true);
    }

    public function scopeEnStock(Builder $q): Builder
    {
        return $q->where('stock_actuel', '>', 0);
    }

    public function scopeAlerteStock(Builder $q): Builder
    {
        return $q->whereColumn('stock_actuel', '<=', 'stock_minimum');
    }

    public function getPrixVenteTtcAttribute(): float
    {
        return round((float) $this->prix_vente_ht * (1 + (float) $this->tva / 100), 2);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
             ->useDisk('products')
             ->withResponsiveImages();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')->width(150)->height(150)->nonQueued();
        $this->addMediaConversion('medium')->width(600)->height(600);
    }
}
