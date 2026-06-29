<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── clients : ajouter contraintes UNIQUE sur les champs d'identité ──
        Schema::table('clients', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->change();
            $table->string('telephone', 20)->nullable()->unique()->change();
            $table->string('ice', 20)->nullable()->unique()->change();
        });

        // ── client_accounts : supprimer l'index normal redondant ──
        // L'index UNIQUE client_accounts_email_unique couvre déjà les lookups.
        Schema::table('client_accounts', function (Blueprint $table) {
            $table->dropIndex('client_accounts_email_index');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropUnique(['telephone']);
            $table->dropUnique(['ice']);
        });

        Schema::table('client_accounts', function (Blueprint $table) {
            $table->index('email');
        });
    }
};
