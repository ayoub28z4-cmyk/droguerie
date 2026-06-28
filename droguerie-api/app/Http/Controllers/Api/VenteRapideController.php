<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProduitResource;
use App\Services\VenteRapideService;
use App\Enums\ModePaiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class VenteRapideController extends Controller
{
    public function __construct(private readonly VenteRapideService $service) {}

    public function chercher(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:1']]);

        $produit = $this->service->chercherProduit($request->q);

        if (! $produit) {
            return response()->json(['data' => null, 'message' => 'Produit introuvable'], 404);
        }

        return response()->json(['data' => new ProduitResource($produit->load('categorie'))]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2']]);

        $q = $request->q;

        $produits = \App\Models\Produit::where('statut', '!=', 'archive')
            ->where(function ($query) use ($q) {
                $query->where('designation', 'like', "%{$q}%")
                      ->orWhere('reference', 'like', "%{$q}%")
                      ->orWhere('code_barre', 'like', "%{$q}%");
            })
            ->orderByRaw("CASE WHEN reference = ? THEN 0 WHEN designation LIKE ? THEN 1 ELSE 2 END", [$q, "{$q}%"])
            ->limit(8)
            ->get();

        return response()->json(['data' => ProduitResource::collection($produits)]);
    }

    public function vendre(Request $request): JsonResponse
    {
        $this->authorize('create', \App\Models\Commande::class);

        $request->validate([
            'lignes'              => ['required', 'array', 'min:1'],
            'lignes.*.produit_id' => ['required', 'integer', 'exists:produits,id'],
            'lignes.*.quantite'   => ['required', 'numeric', 'min:0.001'],
            'mode_paiement'       => ['required', new Enum(ModePaiement::class)],
            'montant_recu'        => ['nullable', 'numeric', 'min:0'],
            'reference'           => ['nullable', 'string', 'max:100'],
            'notes'               => ['nullable', 'string'],
        ]);

        $result = $this->service->vendre($request->only([
            'lignes', 'mode_paiement', 'montant_recu', 'reference', 'notes',
        ]));

        return response()->json(['data' => $result], 201);
    }
}
