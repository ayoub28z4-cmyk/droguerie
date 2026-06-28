<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('telephone', 20)->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->boolean('actif')->default(true);
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();

            $table->index('email');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel');
    }
};
