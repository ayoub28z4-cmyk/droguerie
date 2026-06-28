<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Produit\StoreProduitRequest;
use App\Http\Requests\Produit\UpdateProduitRequest;
use App\Http\Resources\ProduitResource;
use App\Models\Produit;
use App\Services\ProduitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    public function __construct(private readonly ProduitService $produitService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Produit::class);

        // Les clients du portail voient toujours uniquement les produits actifs.
        // Le personnel peut passer avec_inactifs=1 pour inclure les inactifs/archivés.
        $voirTous = auth('personnel')->check() && $request->boolean('avec_inactifs');

        $produits = Produit::with(['categorie', 'fournisseur'])
            ->when($request->search, fn($q, $v) => $q->where('designation', 'like', "%{$v}%")
                ->orWhere('reference', 'like', "%{$v}%"))
            ->when($request->categorie_id, fn($q, $v) => $q->where('categorie_id', $v))
            ->when($request->alerte_stock, fn($q) => $q->alerteStock())
            ->when($request->statut, fn($q, $v) => $q->where('statut', $v))
            ->when(! $voirTous, fn($q) => $q->actif())
            ->orderBy('designation')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => ProduitResource::collection($produits->items()),
            'meta' => [
                'total'        => $produits->total(),
                'per_page'     => $produits->perPage(),
                'current_page' => $produits->currentPage(),
                'last_page'    => $produits->lastPage(),
            ],
        ]);
    }

    public function store(StoreProduitRequest $request): JsonResponse
    {
        $this->authorize('create', Produit::class);

        $produit = $this->produitService->creer($request->validated());

        return (new ProduitResource($produit))->response()->setStatusCode(201);
    }

    public function show(Produit $produit): JsonResponse
    {
        $this->authorize('view', $produit);

        $produit->load(['categorie', 'fournisseur']);

        return response()->json(['data' => new ProduitResource($produit)]);
    }

    public function update(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $this->authorize('update', $produit);

        $produit = $this->produitService->modifier($produit, $request->validated());

        return response()->json(['data' => new ProduitResource($produit)]);
    }

    public function destroy(Produit $produit): JsonResponse
    {
        $this->authorize('delete', $produit);

        $this->produitService->supprimer($produit);

        return response()->json(null, 204);
    }

    public function uploadImage(Request $request, Produit $produit): JsonResponse
    {
        $this->authorize('uploadMedia', $produit);

        $request->validate([
            'images'   => ['required', 'array', 'min:1'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ]);

        foreach ($request->file('images') as $file) {
            $this->produitService->ajouterImage($produit, $file);
        }

        return response()->json(['data' => new ProduitResource($produit->fresh('media'))]);
    }

    public function deleteImage(Produit $produit, int $mediaId): JsonResponse
    {
        $this->authorize('uploadMedia', $produit);

        $this->produitService->supprimerImage($produit, $mediaId);

        return response()->json(null, 204);
    }
}
