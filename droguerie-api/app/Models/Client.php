<?php

namespace App\Models;

use App\Enums\TypeClient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom', 'prenom', 'telephone', 'email', 'adresse', 'ville', 'ice',
        'type_client', 'credit_limite', 'solde_du', 'actif',
    ];

    protected $casts = [
        'type_client'   => TypeClient::class,
        'credit_limite' => 'decimal:2',
        'solde_du'      => 'decimal:2',
        'actif'         => 'boolean',
    ];

    public function account(): HasOne
    {
        return $this->hasOne(ClientAccount::class);
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function scopeActif(Builder $q): Builder
    {
        return $q->where('actif', true);
    }

    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }

    public function getCreditDisponibleAttribute(): float
    {
        return max(0, (float) $this->credit_limite - (float) $this->solde_du);
    }
}
