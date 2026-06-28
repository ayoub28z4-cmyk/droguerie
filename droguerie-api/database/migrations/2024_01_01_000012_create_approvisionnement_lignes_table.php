<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approvisionnement_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approvisionnement_id')->constrained('approvisionnements')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits')->restrictOnDelete();
            $table->decimal('quantite_commandee', 12, 3);
            $table->decimal('quantite_recue', 12, 3)->default(0);
            $table->decimal('prix_achat_unitaire', 12, 2);
            $table->decimal('total_ht', 12, 2);
            $table->timestamps();

            $table->index('approvisionnement_id');
            $table->index('produit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approvisionnement_lignes');
    }
};
