<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventaire\StoreInventaireRequest;
use App\Http\Requests\Inventaire\ValiderInventaireRequest;
use App\Http\Resources\InventaireResource;
use App\Models\Inventaire;
use App\Services\InventaireService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventaireController extends Controller
{
    public function __construct(private readonly InventaireService $inventaireService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Inventaire::class);

        $inventaires = Inventaire::with('personnel')
            ->when($request->statut, fn($q, $v) => $q->where('statut', $v))
            ->orderByDesc('date_inventaire')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => InventaireResource::collection($inventaires->items()),
            'meta' => [
                'total'        => $inventaires->total(),
                'per_page'     => $inventaires->perPage(),
                'current_page' => $inventaires->currentPage(),
                'last_page'    => $inventaires->lastPage(),
            ],
        ]);
    }

    public function store(StoreInventaireRequest $request): JsonResponse
    {
        $this->authorize('create', Inventaire::class);

        $inventaire = $this->inventaireService->creer($request->validated());

        return (new InventaireResource($inventaire))->response()->setStatusCode(201);
    }

    public function show(Inventaire $inventaire): JsonResponse
    {
        $this->authorize('view', $inventaire);

        $inventaire->load(['personnel', 'lignes.produit']);

        return response()->json(['data' => new InventaireResource($inventaire)]);
    }

    public function valider(ValiderInventaireRequest $request, Inventaire $inventaire): JsonResponse
    {
        $this->authorize('valider', $inventaire);

        $this->inventaireService->valider($inventaire);

        return response()->json(['message' => 'Inventaire validé, stocks mis à jour.', 'data' => new InventaireResource($inventaire->fresh())]);
    }
}
