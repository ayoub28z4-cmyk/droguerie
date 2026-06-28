<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\ClientAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            // ── Entreprises ─────────────────────────────────────────────────
            [
                'client' => [
                    'nom'          => 'BATIMAR CONSTRUCTION',
                    'prenom'       => null,
                    'telephone'    => '0522-456789',
                    'email'        => 'achats@batimar.ma',
                    'adresse'      => 'Zone Industrielle Ouled Saleh',
                    'ville'        => 'Casablanca',
                    'ice'          => '002100001000001',
                    'type_client'  => 'entreprise',
                    'credit_limite'=> 150000,
                    'solde_du'     => 28500,
                    'actif'        => true,
                ],
                'account' => ['email' => 'achats@batimar.ma', 'password' => 'password'],
            ],
            [
                'client' => [
                    'nom'          => 'ÉTOILE DU SUD BTP',
                    'prenom'       => null,
                    'telephone'    => '0528-334455',
                    'email'        => 'direction@etoilebtp.ma',
                    'adresse'      => 'Rue des Orangers 12',
                    'ville'        => 'Agadir',
                    'ice'          => '002100001000002',
                    'type_client'  => 'entreprise',
                    'credit_limite'=> 200000,
                    'solde_du'     => 0,
                    'actif'        => true,
                ],
                'account' => ['email' => 'direction@etoilebtp.ma', 'password' => 'password'],
            ],
            [
                'client' => [
                    'nom'          => 'SOCIÉTÉ ALAMI TRAVAUX',
                    'prenom'       => null,
                    'telephone'    => '0535-781234',
                    'email'        => 'commandes@alamitravaux.ma',
                    'adresse'      => 'Bd Mohammed V, Imm. Al Fath',
                    'ville'        => 'Fès',
                    'ice'          => '002100001000003',
                    'type_client'  => 'entreprise',
                    'credit_limite'=> 80000,
                    'solde_du'     => 12000,
                    'actif'        => true,
                ],
                'account' => null,
            ],
            [
                'client' => [
                    'nom'          => 'CHANTIER ROUGE MARRAKECH',
                    'prenom'       => null,
                    'telephone'    => '0524-889900',
                    'email'        => 'crm@chantierrouge.ma',
                    'adresse'      => 'Route de l\'Ourika Km 4',
                    'ville'        => 'Marrakech',
                    'ice'          => '002100001000004',
                    'type_client'  => 'entreprise',
                    'credit_limite'=> 120000,
                    'solde_du'     => 45000,
                    'actif'        => true,
                ],
                'account' => ['email' => 'crm@chantierrouge.ma', 'password' => 'password'],
            ],

            // ── Professionnels ──────────────────────────────────────────────
            [
                'client' => [
                    'nom'          => 'BENALI',
                    'prenom'       => 'Karim',
                    'telephone'    => '0661-234567',
                    'email'        => 'karim.benali@gmail.com',
                    'adresse'      => 'Lotissement Al Wifak, Villa 14',
                    'ville'        => 'Salé',
                    'ice'          => null,
                    'type_client'  => 'professionnel',
                    'credit_limite'=> 30000,
                    'solde_du'     => 5800,
                    'actif'        => true,
                ],
                'account' => ['email' => 'karim.benali@gmail.com', 'password' => 'password'],
            ],
            [
                'client' => [
                    'nom'          => 'TAHIRI',
                    'prenom'       => 'Fatima',
                    'telephone'    => '0677-890123',
                    'email'        => 'ftahiri.arch@outlook.com',
                    'adresse'      => 'Quartier Riyad, Rue 4 N°22',
                    'ville'        => 'Rabat',
                    'ice'          => null,
                    'type_client'  => 'professionnel',
                    'credit_limite'=> 50000,
                    'solde_du'     => 0,
                    'actif'        => true,
                ],
                'account' => ['email' => 'ftahiri.arch@outlook.com', 'password' => 'password'],
            ],
            [
                'client' => [
                    'nom'          => 'OUAZZANI',
                    'prenom'       => 'Hassan',
                    'telephone'    => '0655-441122',
                    'email'        => 'hassan.ouazzani@yahoo.fr',
                    'adresse'      => 'Résidence Najah, Appt 3B',
                    'ville'        => 'Meknès',
                    'ice'          => null,
                    'type_client'  => 'professionnel',
                    'credit_limite'=> 20000,
                    'solde_du'     => 3200,
                    'actif'        => true,
                ],
                'account' => null,
            ],
            [
                'client' => [
                    'nom'          => 'BENSAID',
                    'prenom'       => 'Youssef',
                    'telephone'    => '0644-667788',
                    'email'        => 'y.bensaid.plombier@gmail.com',
                    'adresse'      => 'Hay Mohammadi, Rue 12',
                    'ville'        => 'Casablanca',
                    'ice'          => null,
                    'type_client'  => 'professionnel',
                    'credit_limite'=> 15000,
                    'solde_du'     => 0,
                    'actif'        => true,
                ],
                'account' => ['email' => 'y.bensaid.plombier@gmail.com', 'password' => 'password'],
            ],

            // ── Particuliers ────────────────────────────────────────────────
            [
                'client' => [
                    'nom'          => 'CHRAIBI',
                    'prenom'       => 'Mohammed',
                    'telephone'    => '0612-334455',
                    'email'        => 'm.chraibi@gmail.com',
                    'adresse'      => 'Hay Riad, Rue des Tulipes 8',
                    'ville'        => 'Rabat',
                    'ice'          => null,
                    'type_client'  => 'particulier',
                    'credit_limite'=> 5000,
                    'solde_du'     => 0,
                    'actif'        => true,
                ],
                'account' => null,
            ],
            [
                'client' => [
                    'nom'          => 'EZZAHRAOUI',
                    'prenom'       => 'Nadia',
                    'telephone'    => '0698-556677',
                    'email'        => 'nadia.ezzahraoui@gmail.com',
                    'adresse'      => 'Bd Allal El Fassi 45, Appt 2',
                    'ville'        => 'Casablanca',
                    'ice'          => null,
                    'type_client'  => 'particulier',
                    'credit_limite'=> 3000,
                    'solde_du'     => 1200,
                    'actif'        => true,
                ],
                'account' => ['email' => 'nadia.ezzahraoui@gmail.com', 'password' => 'password'],
            ],
            [
                'client' => [
                    'nom'          => 'BAKKALI',
                    'prenom'       => 'Omar',
                    'telephone'    => '0631-778899',
                    'email'        => null,
                    'adresse'      => 'Derb Soltane, Maison 7',
                    'ville'        => 'Marrakech',
                    'ice'          => null,
                    'type_client'  => 'particulier',
                    'credit_limite'=> 2000,
                    'solde_du'     => 0,
                    'actif'        => true,
                ],
                'account' => null,
            ],
            [
                'client' => [
                    'nom'          => 'LAHLOU',
                    'prenom'       => 'Zineb',
                    'telephone'    => '0619-223344',
                    'email'        => 'zineb.lahlou@hotmail.com',
                    'adresse'      => 'Résidence Al Amal Bloc B',
                    'ville'        => 'Tanger',
                    'ice'          => null,
                    'type_client'  => 'particulier',
                    'credit_limite'=> 4000,
                    'solde_du'     => 800,
                    'actif'        => true,
                ],
                'account' => ['email' => 'zineb.lahlou@hotmail.com', 'password' => 'password'],
            ],
        ];

        foreach ($clients as $entry) {
            $client = Client::firstOrCreate(
                ['telephone' => $entry['client']['telephone']],
                $entry['client']
            );

            if ($entry['account']) {
                ClientAccount::firstOrCreate(
                    ['client_id' => $client->id],
                    [
                        'email'    => $entry['account']['email'],
                        'password' => Hash::make($entry['account']['password']),
                        'actif'    => true,
                    ]
                );
            }
        }

        $this->command->info('Clients créés : ' . count($clients));
    }
}
