<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorieSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Ciment & Béton'  => ['Ciment CPJ', 'Ciment CPA', 'Béton prêt à l\'emploi'],
            'Fer & Acier'      => ['Ronds à béton', 'Profilés acier', 'Treillis soudé'],
            'Carrelage'        => ['Carrelage sol', 'Carrelage mural', 'Faïence'],
            'Plomberie'        => ['Tubes PVC', 'Raccords', 'Robinetterie'],
            'Peinture'         => ['Peinture intérieure', 'Peinture extérieure', 'Enduits'],
            'Bois & Menuiserie'=> ['Planches', 'Contreplaqué', 'Portes'],
            'Électricité'      => ['Câbles', 'Interrupteurs', 'Prises'],
            'Isolation'        => ['Laine de roche', 'Polystyrène', 'Membrane étanche'],
        ];

        foreach ($categories as $parent => $enfants) {
            $cat = Categorie::firstOrCreate(
                ['slug' => Str::slug($parent)],
                ['nom' => $parent, 'actif' => true]
            );

            foreach ($enfants as $enfant) {
                Categorie::firstOrCreate(
                    ['slug' => Str::slug($enfant)],
                    ['nom' => $enfant, 'parent_id' => $cat->id, 'actif' => true]
                );
            }
        }

        $this->command->info('Catégories BTP créées.');
    }
}
