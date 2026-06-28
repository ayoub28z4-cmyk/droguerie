<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fournisseur\StoreFournisseurRequest;
use App\Http\Requests\Fournisseur\UpdateFournisseurRequest;
use App\Http\Resources\FournisseurResource;
use App\Models\Fournisseur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Fournisseur::class);

        $fournisseurs = Fournisseur::when($request->search, fn($q, $v) =>
                $q->where('nom', 'like', "%{$v}%"))
            ->actif()
            ->orderBy('nom')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => FournisseurResource::collection($fournisseurs->items()),
            'meta' => [
                'total'        => $fournisseurs->total(),
                'per_page'     => $fournisseurs->perPage(),
                'current_page' => $fournisseurs->currentPage(),
                'last_page'    => $fournisseurs->lastPage(),
            ],
        ]);
    }

    public function store(StoreFournisseurRequest $request): JsonResponse
    {
        $this->authorize('create', Fournisseur::class);

        $fournisseur = Fournisseur::create($request->validated());

        return (new FournisseurResource($fournisseur))->response()->setStatusCode(201);
    }

    public function show(Fournisseur $fournisseur): JsonResponse
    {
        $this->authorize('view', $fournisseur);

        return response()->json(['data' => new FournisseurResource($fournisseur)]);
    }

    public function update(UpdateFournisseurRequest $request, Fournisseur $fournisseur): JsonResponse
    {
        $this->authorize('update', $fournisseur);

        $fournisseur->update($request->validated());

        return response()->json(['data' => new FournisseurResource($fournisseur->fresh())]);
    }

    public function destroy(Fournisseur $fournisseur): JsonResponse
    {
        $this->authorize('delete', $fournisseur);

        $fournisseur->delete();

        return response()->json(null, 204);
    }
}
