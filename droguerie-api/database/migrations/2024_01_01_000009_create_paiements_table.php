<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->restrictOnDelete();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->foreignId('personnel_id')->nullable()->constrained('personnel')->nullOnDelete();
            $table->decimal('montant', 12, 2);
            $table->string('mode_paiement')->default('especes');
            $table->string('statut')->default('en_attente');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('commande_id');
            $table->index('client_id');
            $table->index('statut');
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
