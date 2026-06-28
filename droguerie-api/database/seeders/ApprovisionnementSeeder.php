<?php

namespace Database\Seeders;

use App\Models\Approvisionnement;
use App\Models\ApprovisionnementLigne;
use App\Models\Fournisseur;
use App\Models\Personnel;
use App\Models\Produit;
use App\Models\StockMouvement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApprovisionnementSeeder extends Seeder
{
    public function run(): void
    {
        $admin     = Personnel::where('email', 'admin@droguerie.ma')->first();
        $magasinier= Personnel::where('email', 'magasinier@droguerie.ma')->first() ?? $admin;

        $fournisseurs = Fournisseur::all()->keyBy('nom');
        $produits     = Produit::all()->keyBy('reference');

        $appros = [
            // ── Validés (stock déjà réceptionné) ───────────────────────
            [
                'fournisseur' => 'Lafarge Holcim Maroc',
                'statut'      => 'valide',
                'numero_bl'   => 'BL-LHM-2026-001',
                'reception'   => now()->subDays(50),
                'lignes'      => [
                    ['ref' => 'CIM-CPJ-001', 'qte_cmd' => 500, 'qte_recue' => 500, 'prix' => 52.00],
                    ['ref' => 'CIM-CPA-001', 'qte_cmd' => 300, 'qte_recue' => 300, 'prix' => 58.00],
                    ['ref' => 'CIM-BLK-001', 'qte_cmd' => 2000,'qte_recue' => 2000,'prix' => 4.20],
                ],
            ],
            [
                'fournisseur' => 'Sonasid Acier',
                'statut'      => 'valide',
                'numero_bl'   => 'BL-SON-2026-001',
                'reception'   => now()->subDays(45),
                'lignes'      => [
                    ['ref' => 'FER-HA-010', 'qte_cmd' => 300, 'qte_recue' => 300, 'prix' => 45.00],
                    ['ref' => 'FER-HA-012', 'qte_cmd' => 200, 'qte_recue' => 200, 'prix' => 62.00],
                    ['ref' => 'FER-HA-016', 'qte_cmd' => 100, 'qte_recue' => 100, 'prix' => 108.00],
                    ['ref' => 'FER-TRE-001', 'qte_cmd'=> 150, 'qte_recue' => 150, 'prix' => 185.00],
                ],
            ],
            [
                'fournisseur' => 'Tileya Carrelage',
                'statut'      => 'valide',
                'numero_bl'   => 'BL-TIL-2026-001',
                'reception'   => now()->subDays(35),
                'lignes'      => [
                    ['ref' => 'CAR-SOL-001', 'qte_cmd' => 600, 'qte_recue' => 600, 'prix' => 88.00],
                    ['ref' => 'CAR-SOL-002', 'qte_cmd' => 250, 'qte_recue' => 250, 'prix' => 155.00],
                    ['ref' => 'CAR-MUR-001', 'qte_cmd' => 400, 'qte_recue' => 400, 'prix' => 62.00],
                ],
            ],

            // ── Réceptionnés (en attente de validation) ─────────────────
            [
                'fournisseur' => 'ColorPlus Peintures',
                'statut'      => 'receptionne',
                'numero_bl'   => 'BL-CPL-2026-001',
                'reception'   => now()->subDays(5),
                'lignes'      => [
                    ['ref' => 'PNT-INT-001', 'qte_cmd' => 100, 'qte_recue' => 100, 'prix' => 195.00],
                    ['ref' => 'PNT-EXT-001', 'qte_cmd' => 80,  'qte_recue' => 75,  'prix' => 320.00],
                    ['ref' => 'PNT-END-001', 'qte_cmd' => 150, 'qte_recue' => 150, 'prix' => 65.00],
                ],
            ],
            [
                'fournisseur' => 'Electro BTP Supply',
                'statut'      => 'receptionne',
                'numero_bl'   => 'BL-ELE-2026-001',
                'reception'   => now()->subDays(3),
                'lignes'      => [
                    ['ref' => 'ELE-CAB-001', 'qte_cmd' => 60,  'qte_recue' => 60,  'prix' => 245.00],
                    ['ref' => 'ELE-CAB-002', 'qte_cmd' => 45,  'qte_recue' => 45,  'prix' => 385.00],
                    ['ref' => 'ELE-INT-001', 'qte_cmd' => 250, 'qte_recue' => 250, 'prix' => 18.00],
                    ['ref' => 'ELE-PRI-001', 'qte_cmd' => 250, 'qte_recue' => 250, 'prix' => 22.00],
                ],
            ],

            // ── En transit ──────────────────────────────────────────────
            [
                'fournisseur' => 'Bois & Co Maroc',
                'statut'      => 'en_transit',
                'numero_bl'   => null,
                'reception'   => null,
                'lignes'      => [
                    ['ref' => 'BOI-CTP-001', 'qte_cmd' => 100, 'qte_recue' => 0, 'prix' => 185.00],
                    ['ref' => 'BOI-PLN-001', 'qte_cmd' => 200, 'qte_recue' => 0, 'prix' => 42.00],
                    ['ref' => 'BOI-POR-001', 'qte_cmd' => 30,  'qte_recue' => 0, 'prix' => 480.00],
                ],
            ],

            // ── Commandés ───────────────────────────────────────────────
            [
                'fournisseur' => 'Isomaroc Isolation',
                'statut'      => 'commande',
                'numero_bl'   => null,
                'reception'   => null,
                'lignes'      => [
                    ['ref' => 'ISO-LDR-001', 'qte_cmd' => 80,  'qte_recue' => 0, 'prix' => 195.00],
                    ['ref' => 'ISO-PSE-001', 'qte_cmd' => 300, 'qte_recue' => 0, 'prix' => 28.00],
                    ['ref' => 'ISO-MEM-001', 'qte_cmd' => 50,  'qte_recue' => 0, 'prix' => 420.00],
                ],
            ],

            // ── Brouillon ────────────────────────────────────────────────
            [
                'fournisseur' => 'Société Marocaine de Plomberie',
                'statut'      => 'brouillon',
                'numero_bl'   => null,
                'reception'   => null,
                'lignes'      => [
                    ['ref' => 'PLO-PVC-032', 'qte_cmd' => 200, 'qte_recue' => 0, 'prix' => 22.00],
                    ['ref' => 'PLO-PVC-050', 'qte_cmd' => 150, 'qte_recue' => 0, 'prix' => 34.00],
                    ['ref' => 'PLO-RAC-001', 'qte_cmd' => 500, 'qte_recue' => 0, 'prix' => 5.50],
                    ['ref' => 'PLO-ROB-001', 'qte_cmd' => 30,  'qte_recue' => 0, 'prix' => 185.00],
                ],
            ],
        ];

        foreach ($appros as $data) {
            DB::transaction(function () use ($data, $fournisseurs, &$produits, $admin, $magasinier) {
                $fournisseur = $fournisseurs[$data['fournisseur']] ?? null;
                if (! $fournisseur) {
                    $this->command->warn("Fournisseur introuvable : {$data['fournisseur']}");
                    return;
                }

                $montantTotal = collect($data['lignes'])->sum(
                    fn ($l) => $l['qte_cmd'] * $l['prix']
                );

                $appro = Approvisionnement::create([
                    'fournisseur_id' => $fournisseur->id,
                    'personnel_id'   => $admin->id,
                    'numero_bl'      => $data['numero_bl'],
                    'statut'         => $data['statut'],
                    'date_reception' => $data['reception'],
                    'montant_total'  => $montantTotal,
                    'created_at'     => $data['reception'] ?? now()->subDays(rand(1, 10)),
                ]);

                foreach ($data['lignes'] as $ligneData) {
                    $produit = $produits[$ligneData['ref']] ?? null;
                    if (! $produit) continue;

                    ApprovisionnementLigne::create([
                        'approvisionnement_id' => $appro->id,
                        'produit_id'           => $produit->id,
                        'quantite_commandee'   => $ligneData['qte_cmd'],
                        'quantite_recue'       => $ligneData['qte_recue'],
                        'prix_achat_unitaire'  => $ligneData['prix'],
                        'total_ht'             => round($ligneData['qte_cmd'] * $ligneData['prix'], 2),
                    ]);

                    // Mouvements stock pour approvisionnements validés / réceptionnés
                    if (in_array($data['statut'], ['valide', 'receptionne']) && $ligneData['qte_recue'] > 0) {
                        $stockAvant = $produit->stock_actuel;
                        $stockApres = $stockAvant + $ligneData['qte_recue'];

                        StockMouvement::create([
                            'produit_id'         => $produit->id,
                            'personnel_id'       => $magasinier->id,
                            'approvisionnement_id'=> $appro->id,
                            'fournisseur_id'     => $fournisseur->id,
                            'type_mouvement'     => 'entree',
                            'quantite'           => $ligneData['qte_recue'],
                            'stock_avant'        => $stockAvant,
                            'stock_apres'        => $stockApres,
                            'prix_unitaire'      => $ligneData['prix'],
                            'motif'              => 'Réception ' . ($data['numero_bl'] ?? 'appro #' . $appro->id),
                            'created_at'         => $data['reception'],
                        ]);

                        $produit->update(['stock_actuel' => $stockApres]);
                        $produits = $produits->put($ligneData['ref'], $produit->fresh());
                    }
                }
            });
        }

        $this->command->info('Approvisionnements créés : ' . count($appros));
    }
}
