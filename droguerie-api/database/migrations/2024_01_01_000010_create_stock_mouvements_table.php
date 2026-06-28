<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_mouvements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->restrictOnDelete();
            $table->foreignId('personnel_id')->nullable()->constrained('personnel')->nullOnDelete();
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->nullOnDelete();
            $table->foreignId('approvisionnement_id')->nullable();
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->string('type_mouvement');
            $table->decimal('quantite', 12, 3);
            $table->decimal('stock_avant', 12, 3);
            $table->decimal('stock_apres', 12, 3);
            $table->decimal('prix_unitaire', 12, 2)->default(0);
            $table->text('motif')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('produit_id');
            $table->index('type_mouvement');
            $table->index('commande_id');
            $table->index('approvisionnement_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_mouvements');
    }
};
