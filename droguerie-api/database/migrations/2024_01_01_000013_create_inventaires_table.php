<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->nullable()->constrained('personnel')->nullOnDelete();
            $table->string('statut')->default('brouillon');
            $table->date('date_inventaire');
            $table->text('notes')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('statut');
            $table->index('date_inventaire');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaires');
    }
};
