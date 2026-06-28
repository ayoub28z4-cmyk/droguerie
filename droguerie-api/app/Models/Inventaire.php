<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventaire extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'personnel_id', 'statut', 'date_inventaire', 'notes', 'validated_at',
    ];

    protected $casts = [
        'date_inventaire' => 'date',
        'validated_at'    => 'datetime',
    ];

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(InventaireLigne::class);
    }

    public function scopeBrouillon(Builder $q): Builder
    {
        return $q->where('statut', 'brouillon');
    }

    public function scopeValide(Builder $q): Builder
    {
        return $q->where('statut', 'valide');
    }
}
