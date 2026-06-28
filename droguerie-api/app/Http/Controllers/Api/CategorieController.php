<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategorieResource;
use App\Models\Categorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategorieController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Categorie::with('enfants')
            ->withCount('produits')
            ->when($request->boolean('racine'), fn($q) => $q->racine())
            ->when($request->has('actif'), fn($q) => $q->where('actif', $request->boolean('actif')))
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => CategorieResource::collection($categories)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Categorie::class);

        $validated = $request->validate([
            'nom'         => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'actif'       => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['nom']) . '-' . Str::random(4);

        $categorie = Categorie::create($validated);

        return (new CategorieResource($categorie))->response()->setStatusCode(201);
    }

    public function show(Categorie $categorie): JsonResponse
    {
        $categorie->load('parent', 'enfants', 'produits');

        return response()->json(['data' => new CategorieResource($categorie)]);
    }

    public function update(Request $request, Categorie $categorie): JsonResponse
    {
        $this->authorize('update', Categorie::class);

        $validated = $request->validate([
            'nom'         => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'actif'       => ['boolean'],
        ]);

        if (isset($validated['nom'])) {
            $validated['slug'] = Str::slug($validated['nom']) . '-' . Str::random(4);
        }

        $categorie->update($validated);

        return response()->json(['data' => new CategorieResource($categorie->fresh('enfants'))]);
    }

    public function destroy(Categorie $categorie): JsonResponse
    {
        $this->authorize('delete', Categorie::class);

        if ($categorie->produits()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer une catégorie contenant des produits.'], 422);
        }

        $categorie->delete();

        return response()->json(null, 204);
    }
}
