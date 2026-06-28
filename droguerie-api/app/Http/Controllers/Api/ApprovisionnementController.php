<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Approvisionnement\ReceptionnerApprovisionnementRequest;
use App\Http\Requests\Approvisionnement\StoreApprovisionnementRequest;
use App\Http\Resources\ApprovisionnementResource;
use App\Models\Approvisionnement;
use App\Services\ApprovisionnementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovisionnementController extends Controller
{
    public function __construct(private readonly ApprovisionnementService $approvisionnementService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Approvisionnement::class);

        $appros = Approvisionnement::with(['fournisseur', 'personnel'])
            ->when($request->statut, fn($q, $v) => $q->where('statut', $v))
            ->when($request->fournisseur_id, fn($q, $v) => $q->where('fournisseur_id', $v))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => ApprovisionnementResource::collection($appros->items()),
            'meta' => [
                'total'        => $appros->total(),
                'per_page'     => $appros->perPage(),
                'current_page' => $appros->currentPage(),
                'last_page'    => $appros->lastPage(),
            ],
        ]);
    }

    public function store(StoreApprovisionnementRequest $request): JsonResponse
    {
        $this->authorize('create', Approvisionnement::class);

        $approvisionnement = $this->approvisionnementService->creer($request->validated());

        return (new ApprovisionnementResource($approvisionnement))->response()->setStatusCode(201);
    }

    public function show(Approvisionnement $approvisionnement): JsonResponse
    {
        $this->authorize('view', $approvisionnement);

        $approvisionnement->load(['fournisseur', 'personnel', 'lignes.produit']);

        return response()->json(['data' => new ApprovisionnementResource($approvisionnement)]);
    }

    public function commander(Approvisionnement $approvisionnement): JsonResponse
    {
        $this->authorize('update', $approvisionnement);

        $this->approvisionnementService->transitionner(
            $approvisionnement,
            \App\Enums\StatutApprovisionnement::Commande
        );

        return response()->json(['message' => 'Approvisionnement commandé.', 'data' => new ApprovisionnementResource($approvisionnement->fresh())]);
    }

    public function mettreEnTransit(Approvisionnement $approvisionnement): JsonResponse
    {
        $this->authorize('update', $approvisionnement);

        $this->approvisionnementService->transitionner(
            $approvisionnement,
            \App\Enums\StatutApprovisionnement::EnTransit
        );

        return response()->json(['message' => 'Approvisionnement en transit.', 'data' => new ApprovisionnementResource($approvisionnement->fresh())]);
    }

    public function receptionner(ReceptionnerApprovisionnementRequest $request, Approvisionnement $approvisionnement): JsonResponse
    {
        $this->authorize('update', $approvisionnement);

        $this->approvisionnementService->receptionner($approvisionnement, $request->validated());

        return response()->json(['message' => 'Approvisionnement réceptionné.', 'data' => new ApprovisionnementResource($approvisionnement->fresh()->load('lignes.produit'))]);
    }

    public function valider(Approvisionnement $approvisionnement): JsonResponse
    {
        $this->authorize('valider', $approvisionnement);

        $this->approvisionnementService->valider($approvisionnement);

        return response()->json(['message' => 'Approvisionnement validé, stock mis à jour.', 'data' => new ApprovisionnementResource($approvisionnement->fresh())]);
    }
}
