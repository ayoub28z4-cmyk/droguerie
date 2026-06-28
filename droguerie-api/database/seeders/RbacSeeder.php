<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'produits.view', 'produits.create', 'produits.update', 'produits.delete',
            'clients.view', 'clients.create', 'clients.update', 'clients.delete',
            'commandes.view', 'commandes.create', 'commandes.update', 'commandes.annuler',
            'stock.view', 'stock.create', 'stock.ajuster',
            'approvisionnements.view', 'approvisionnements.create', 'approvisionnements.valider',
            'inventaires.view', 'inventaires.create', 'inventaires.valider',
            'paiements.view', 'paiements.create', 'paiements.valider',
            'personnel.view', 'personnel.create', 'personnel.update', 'personnel.delete',
            'fournisseurs.view', 'fournisseurs.create', 'fournisseurs.update',
            'rapports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'personnel']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'personnel']);
        $admin->syncPermissions($permissions);

        $vendeur = Role::firstOrCreate(['name' => 'vendeur', 'guard_name' => 'personnel']);
        $vendeur->syncPermissions([
            'commandes.view', 'commandes.create', 'commandes.update', 'commandes.annuler',
            'clients.view', 'clients.create', 'clients.update',
            'produits.view',
            'stock.view',
            'paiements.view', 'paiements.create', 'paiements.valider',
            'rapports.view',
        ]);

        $magasinier = Role::firstOrCreate(['name' => 'magasinier', 'guard_name' => 'personnel']);
        $magasinier->syncPermissions([
            'stock.view', 'stock.create', 'stock.ajuster',
            'approvisionnements.view', 'approvisionnements.create', 'approvisionnements.valider',
            'inventaires.view', 'inventaires.create', 'inventaires.valider',
            'produits.view',
            'fournisseurs.view',
        ]);

        $this->command->info('RBAC : rôles et permissions créés.');
    }
}
