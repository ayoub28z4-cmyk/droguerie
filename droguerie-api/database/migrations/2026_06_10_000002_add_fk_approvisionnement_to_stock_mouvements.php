<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->foreign('approvisionnement_id')
                  ->references('id')
                  ->on('approvisionnements')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->dropForeign(['approvisionnement_id']);
        });
    }
};
