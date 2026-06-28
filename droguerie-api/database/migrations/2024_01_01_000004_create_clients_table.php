<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom')->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('ice', 20)->nullable();
            $table->string('type_client')->default('particulier');
            $table->decimal('credit_limite', 12, 2)->default(0);
            $table->decimal('solde_du', 12, 2)->default(0);
            $table->boolean('actif')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('type_client');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
