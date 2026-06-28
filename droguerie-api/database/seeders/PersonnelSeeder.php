<?php

namespace Database\Seeders;

use App\Models\Personnel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PersonnelSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Personnel::firstOrCreate(
            ['email' => 'admin@droguerie.ma'],
            [
                'nom'      => 'Administrateur',
                'prenom'   => 'Super',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $admin->syncRoles(['admin']);

        $vendeur = Personnel::firstOrCreate(
            ['email' => 'vendeur@droguerie.ma'],
            [
                'nom'      => 'Dupont',
                'prenom'   => 'Jean',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $vendeur->syncRoles(['vendeur']);

        $magasinier = Personnel::firstOrCreate(
            ['email' => 'magasinier@droguerie.ma'],
            [
                'nom'      => 'Martin',
                'prenom'   => 'Paul',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $magasinier->syncRoles(['magasinier']);

        $this->command->info('Personnel de base créé.');
    }
}
