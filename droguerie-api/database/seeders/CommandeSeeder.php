<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Commande;
use App\Models\CommandeLigne;
use App\Models\Paiement;
use App\Models\Personnel;
use App\Models\Produit;
use App\Models\StockMouvement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommandeSeeder extends Seeder
{
    private int $orderSeq = 1;

    public function run(): void
    {
        $personnel = Personnel::all()->keyBy('email');
        $admin     = $personnel['admin@droguerie.ma'];
        $vendeur   = $personnel['vendeur@droguerie.ma'] ?? $admin;

        $clients  = Client::all();
        $produits = Produit::all()->keyBy('reference');

        $commandes = [
            // ── Commandes livrées / clôturées ────────────────────────────
            [
                'client'      => 'BATIMAR CONSTRUCTION',
                'statut'      => 'cloturee',
                'canal'       => 'magasin',
                'personnel'   => $admin,
                'created_at'  => now()->subDays(45),
                'lignes'      => [
                    ['ref' => 'CIM-CPJ-001', 'qte' => 100, 'prix' => 68.00],
                    ['ref' => 'FER-HA-010',  'qte' => 50,  'prix' => 58.00],
                    ['ref' => 'FER-HA-012',  'qte' => 30,  'prix' => 79.00],
                ],
                'paiements'   => [
                    ['montant' => 8000, 'mode' => 'virement', 'statut' => 'valide', 'jours' => 44],
                    ['montant' => 4140, 'mode' => 'virement', 'statut' => 'valide', 'jours' => 30],
                ],
            ],
            [
                'client'      => 'ÉTOILE DU SUD BTP',
                'statut'      => 'livree',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subDays(30),
                'lignes'      => [
                    ['ref' => 'CAR-SOL-001', 'qte' => 120, 'prix' => 115.00],
                    ['ref' => 'CAR-MUR-001', 'qte' => 80,  'prix' => 82.00],
                    ['ref' => 'PNT-END-001', 'qte' => 20,  'prix' => 85.00],
                ],
                'paiements'   => [
                    ['montant' => 10000, 'mode' => 'cheque', 'statut' => 'valide', 'jours' => 28],
                    ['montant' => 7260,  'mode' => 'virement', 'statut' => 'valide', 'jours' => 15],
                ],
            ],
            [
                'client'      => 'BENALI',
                'statut'      => 'cloturee',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subDays(38),
                'lignes'      => [
                    ['ref' => 'PLO-PVC-032', 'qte' => 20,  'prix' => 30.00],
                    ['ref' => 'PLO-PVC-050', 'qte' => 10,  'prix' => 45.00],
                    ['ref' => 'PLO-ROB-001', 'qte' => 3,   'prix' => 245.00],
                ],
                'paiements'   => [
                    ['montant' => 1785, 'mode' => 'especes', 'statut' => 'valide', 'jours' => 36],
                ],
            ],
            [
                'client'      => 'CHRAIBI',
                'statut'      => 'livree',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subDays(20),
                'lignes'      => [
                    ['ref' => 'PNT-INT-001', 'qte' => 4,   'prix' => 255.00],
                    ['ref' => 'PNT-END-001', 'qte' => 5,   'prix' => 85.00],
                ],
                'paiements'   => [
                    ['montant' => 1445, 'mode' => 'especes', 'statut' => 'valide', 'jours' => 18],
                ],
            ],
            [
                'client'      => 'CHANTIER ROUGE MARRAKECH',
                'statut'      => 'cloturee',
                'canal'       => 'magasin',
                'personnel'   => $admin,
                'created_at'  => now()->subDays(60),
                'lignes'      => [
                    ['ref' => 'CIM-CPA-001', 'qte' => 80,  'prix' => 75.00],
                    ['ref' => 'FER-HA-016',  'qte' => 40,  'prix' => 138.00],
                    ['ref' => 'FER-TRE-001', 'qte' => 25,  'prix' => 235.00],
                    ['ref' => 'BOI-CTP-001', 'qte' => 30,  'prix' => 240.00],
                ],
                'paiements'   => [
                    ['montant' => 15000, 'mode' => 'virement', 'statut' => 'valide', 'jours' => 58],
                    ['montant' => 10220, 'mode' => 'virement', 'statut' => 'valide', 'jours' => 40],
                ],
            ],

            // ── Commandes en cours ───────────────────────────────────────
            [
                'client'      => 'BATIMAR CONSTRUCTION',
                'statut'      => 'en_livraison',
                'canal'       => 'magasin',
                'personnel'   => $admin,
                'created_at'  => now()->subDays(5),
                'lignes'      => [
                    ['ref' => 'CIM-CPJ-001', 'qte' => 200, 'prix' => 68.00],
                    ['ref' => 'CIM-BLK-001', 'qte' => 500, 'prix' => 5.80],
                ],
                'paiements'   => [
                    ['montant' => 5000, 'mode' => 'virement', 'statut' => 'valide', 'jours' => 4],
                ],
            ],
            [
                'client'      => 'SOCIÉTÉ ALAMI TRAVAUX',
                'statut'      => 'en_preparation',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subDays(3),
                'lignes'      => [
                    ['ref' => 'ELE-CAB-001', 'qte' => 10,  'prix' => 320.00],
                    ['ref' => 'ELE-CAB-002', 'qte' => 8,   'prix' => 495.00],
                    ['ref' => 'ELE-INT-001', 'qte' => 50,  'prix' => 26.00],
                    ['ref' => 'ELE-PRI-001', 'qte' => 50,  'prix' => 32.00],
                ],
                'paiements'   => [],
            ],
            [
                'client'      => 'TAHIRI',
                'statut'      => 'confirmee',
                'canal'       => 'portail',
                'personnel'   => null,
                'created_at'  => now()->subDays(2),
                'lignes'      => [
                    ['ref' => 'ISO-LDR-001', 'qte' => 8,   'prix' => 260.00],
                    ['ref' => 'ISO-PSE-001', 'qte' => 30,  'prix' => 38.00],
                    ['ref' => 'ISO-MEM-001', 'qte' => 5,   'prix' => 560.00],
                ],
                'paiements'   => [
                    ['montant' => 2000, 'mode' => 'virement', 'statut' => 'en_attente', 'jours' => 1],
                ],
            ],
            [
                'client'      => 'EZZAHRAOUI',
                'statut'      => 'en_attente',
                'canal'       => 'portail',
                'personnel'   => null,
                'created_at'  => now()->subHours(8),
                'lignes'      => [
                    ['ref' => 'CAR-SOL-002', 'qte' => 25,  'prix' => 195.00],
                    ['ref' => 'CAR-MUR-001', 'qte' => 15,  'prix' => 82.00],
                ],
                'paiements'   => [],
            ],
            [
                'client'      => 'BENSAID',
                'statut'      => 'en_attente',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subHours(3),
                'lignes'      => [
                    ['ref' => 'PLO-PVC-032', 'qte' => 15,  'prix' => 30.00],
                    ['ref' => 'PLO-ROB-001', 'qte' => 2,   'prix' => 245.00],
                ],
                'paiements'   => [],
            ],

            // ── Commandes annulées ───────────────────────────────────────
            [
                'client'      => 'OUAZZANI',
                'statut'      => 'annulee',
                'canal'       => 'magasin',
                'personnel'   => $vendeur,
                'created_at'  => now()->subDays(15),
                'lignes'      => [
                    ['ref' => 'BOI-POR-001', 'qte' => 5,   'prix' => 620.00],
                    ['ref' => 'BOI-PLN-001', 'qte' => 20,  'prix' => 55.00],
                ],
                'paiements'   => [],
            ],
            [
                'client'      => 'LAHLOU',
                'statut'      => 'en_attente',
                'canal'       => 'portail',
                'personnel'   => null,
                'created_at'  => now()->subDays(1),
                'lignes'      => [
                    ['ref' => 'PNT-EXT-001', 'qte' => 2,   'prix' => 420.00],
                    ['ref' => 'PNT-INT-001', 'qte' => 2,   'prix' => 255.00],
                ],
                'paiements'   => [],
            ],
        ];

        $clientsMap = Client::all()->keyBy(fn ($c) => trim("{$c->prenom} {$c->nom}"))
            ->merge(Client::all()->keyBy('nom'));

        foreach ($commandes as $data) {
            DB::transaction(function () use ($data, $clientsMap, &$produits, $admin) {
                $clientKey = $data['client'];
                $client = $clientsMap[$clientKey]
                    ?? Client::where('nom', 'like', "%{$clientKey}%")->first();

                if (! $client) {
                    $this->command->warn("Client introuvable : {$clientKey}");
                    return;
                }

                // Calculer montants
                $montantHt  = 0;
                $montantTva = 0;
                foreach ($data['lignes'] as $ligne) {
                    $tva        = 20;
                    $totalHt    = $ligne['qte'] * $ligne['prix'];
                    $montantHt  += $totalHt;
                    $montantTva += round($totalHt * $tva / 100, 2);
                }
                $montantTtc = round($montantHt + $montantTva, 2);
                $montantPaye = 0;
                foreach ($data['paiements'] as $p) {
                    if ($p['statut'] === 'valide') {
                        $montantPaye += $p['montant'];
                    }
                }
                $resteAPayer = max(0, $montantTtc - $montantPaye);

                $numero = 'CMD-' . str_pad($this->orderSeq++, 5, '0', STR_PAD_LEFT);

                $commande = Commande::create([
                    'numero'        => $numero,
                    'client_id'     => $client->id,
                    'personnel_id'  => $data['personnel']?->id,
                    'statut'        => $data['statut'],
                    'canal'         => $data['canal'],
                    'montant_ht'    => $montantHt,
                    'tva'           => $montantTva,
                    'montant_ttc'   => $montantTtc,
                    'montant_paye'  => $montantPaye,
                    'reste_a_payer' => $resteAPayer,
                    'created_at'    => $data['created_at'],
                    'updated_at'    => $data['created_at'],
                ]);

                // Lignes
                foreach ($data['lignes'] as $ligneData) {
                    $produit = $produits[$ligneData['ref']] ?? null;
                    if (! $produit) continue;

                    $totalHt = round($ligneData['qte'] * $ligneData['prix'], 2);

                    CommandeLigne::create([
                        'commande_id'     => $commande->id,
                        'produit_id'      => $produit->id,
                        'quantite'        => $ligneData['qte'],
                        'prix_unitaire_ht'=> $ligneData['prix'],
                        'tva'             => 20,
                        'total_ht'        => $totalHt,
                    ]);

                    // Mouvements stock pour commandes livrées/clôturées
                    if (in_array($data['statut'], ['livree', 'cloturee', 'en_livraison'])) {
                        $stockAvant = $produit->stock_actuel;
                        $stockApres = max(0, $stockAvant - $ligneData['qte']);

                        StockMouvement::create([
                            'produit_id'   => $produit->id,
                            'personnel_id' => $data['personnel']?->id ?? $admin->id,
                            'commande_id'  => $commande->id,
                            'type_mouvement'=> 'sortie',
                            'quantite'     => $ligneData['qte'],
                            'stock_avant'  => $stockAvant,
                            'stock_apres'  => $stockApres,
                            'prix_unitaire'=> $ligneData['prix'],
                            'motif'        => 'Vente commande ' . $numero,
                            'created_at'   => $data['created_at'],
                        ]);

                        $produit->update(['stock_actuel' => $stockApres]);
                        $produits = $produits->put($ligneData['ref'], $produit->fresh());
                    }
                }

                // Paiements
                foreach ($data['paiements'] as $paiData) {
                    Paiement::create([
                        'commande_id'   => $commande->id,
                        'client_id'     => $client->id,
                        'personnel_id'  => $data['personnel']?->id ?? $admin->id,
                        'montant'       => $paiData['montant'],
                        'mode_paiement' => $paiData['mode'],
                        'statut'        => $paiData['statut'],
                        'paid_at'       => $paiData['statut'] === 'valide'
                            ? now()->subDays($paiData['jours'])
                            : null,
                    ]);
                }
            });
        }

        $this->command->info('Commandes créées : ' . count($commandes));
    }
}
