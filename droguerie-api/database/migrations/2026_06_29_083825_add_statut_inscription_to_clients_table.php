<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('statut_inscription')->nullable()->after('actif');
            $table->text('motif_rejet')->nullable()->after('statut_inscription');
            $table->index('statut_inscription');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['statut_inscription']);
            $table->dropColumn(['statut_inscription', 'motif_rejet']);
        });
    }
};
