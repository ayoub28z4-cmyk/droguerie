<?php

namespace Database\Seeders;

use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class FournisseurSeeder extends Seeder
{
    public function run(): void
    {
        $fournisseurs = [
            [
                'nom'      => 'Lafarge Holcim Maroc',
                'email'    => 'commandes@lafarge.ma',
                'telephone'=> '0522-301010',
                'adresse'  => 'Route de Rabat, Km 12',
                'ville'    => 'Casablanca',
                'ice'      => '001234567000001',
                'solde_du' => 0,
                'actif'    => true,
            ],
            [
                'nom'      => 'Sonasid Acier',
                'email'    => 'ventes@sonasid.ma',
                'telephone'=> '0537-659000',
                'adresse'  => 'Zone Industrielle Ahfir',
                'ville'    => 'Nador',
                'ice'      => '001234567000002',
                'solde_du' => 15000,
                'actif'    => true,
            ],
            [
                'nom'      => 'Tileya Carrelage',
                'email'    => 'contact@tileya.ma',
                'telephone'=> '0524-447788',
                'adresse'  => 'Quartier Industriel Sidi Ghanem',
                'ville'    => 'Marrakech',
                'ice'      => '001234567000003',
                'solde_du' => 8500,
                'actif'    => true,
            ],
            [
                'nom'      => 'Société Marocaine de Plomberie',
                'email'    => 'info@smplomberie.ma',
                'telephone'=> '0535-622344',
                'adresse'  => 'Rue du Commerce 45',
                'ville'    => 'Fès',
                'ice'      => '001234567000004',
                'solde_du' => 0,
                'actif'    => true,
            ],
            [
                'nom'      => 'ColorPlus Peintures',
                'email'    => 'ventes@colorplus.ma',
                'telephone'=> '0528-834455',
                'adresse'  => 'Avenue Hassan II, Bloc C',
                'ville'    => 'Agadir',
                'ice'      => '001234567000005',
                'solde_du' => 3200,
                'actif'    => true,
            ],
            [
                'nom'      => 'Bois & Co Maroc',
                'email'    => 'commandes@boiscomaroc.ma',
                'telephone'=> '0537-771122',
                'adresse'  => 'Zone Industrielle Aïn Johra',
                'ville'    => 'Rabat',
                'ice'      => '001234567000006',
                'solde_du' => 0,
                'actif'    => true,
            ],
            [
                'nom'      => 'Electro BTP Supply',
                'email'    => 'achats@electrobtp.ma',
                'telephone'=> '0522-889966',
                'adresse'  => 'Bd Zerktouni 112',
                'ville'    => 'Casablanca',
                'ice'      => '001234567000007',
                'solde_du' => 0,
                'actif'    => true,
            ],
            [
                'nom'      => 'Isomaroc Isolation',
                'email'    => 'info@isomaroc.ma',
                'telephone'=> '0525-113344',
                'adresse'  => 'Route de Meknès Km 5',
                'ville'    => 'Meknès',
                'ice'      => '001234567000008',
                'solde_du' => 5600,
                'actif'    => true,
            ],
        ];

        foreach ($fournisseurs as $data) {
            Fournisseur::firstOrCreate(['ice' => $data['ice']], $data);
        }

        $this->command->info('Fournisseurs créés : ' . count($fournisseurs));
    }
}
