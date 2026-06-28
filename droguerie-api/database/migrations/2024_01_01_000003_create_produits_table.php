<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('designation');
            $table->text('description')->nullable();
            $table->decimal('prix_achat', 12, 2)->default(0);
            $table->decimal('prix_vente_ht', 12, 2);
            $table->decimal('tva', 5, 2)->default(20);
            $table->string('unite', 20)->default('unité');
            $table->decimal('stock_actuel', 12, 3)->default(0);
            $table->decimal('stock_minimum', 12, 3)->default(0);
            $table->decimal('stock_maximum', 12, 3)->nullable();
            $table->foreignId('categorie_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->string('statut')->default('actif');
            $table->boolean('actif')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('reference');
            $table->index('statut');
            $table->index('actif');
            $table->index('categorie_id');
            $table->index('fournisseur_id');
            $table->index(['stock_actuel', 'stock_minimum']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
