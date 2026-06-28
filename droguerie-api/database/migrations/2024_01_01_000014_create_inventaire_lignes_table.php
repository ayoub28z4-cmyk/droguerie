<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventaire_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventaire_id')->constrained('inventaires')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits')->restrictOnDelete();
            $table->decimal('stock_theorique', 12, 3);
            $table->decimal('stock_reel', 12, 3);
            $table->decimal('ecart', 12, 3)->storedAs('stock_reel - stock_theorique');
            $table->text('motif_ecart')->nullable();
            $table->timestamps();

            $table->index('inventaire_id');
            $table->index('produit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaire_lignes');
    }
};
