<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Paiement\StorePaiementRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use App\Services\PaiementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function __construct(private readonly PaiementService $paiementService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Paiement::class);

        $paiements = Paiement::with(['commande', 'client', 'personnel'])
            ->when($request->commande_id, fn($q, $v) => $q->where('commande_id', $v))
            ->when($request->client_id, fn($q, $v) => $q->where('client_id', $v))
            ->when($request->statut, fn($q, $v) => $q->where('statut', $v))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => PaiementResource::collection($paiements->items()),
            'meta' => [
                'total'        => $paiements->total(),
                'per_page'     => $paiements->perPage(),
                'current_page' => $paiements->currentPage(),
                'last_page'    => $paiements->lastPage(),
            ],
        ]);
    }

    public function store(StorePaiementRequest $request): JsonResponse
    {
        $this->authorize('create', Paiement::class);

        $paiement = $this->paiementService->enregistrer($request->validated());

        return (new PaiementResource($paiement))->response()->setStatusCode(201);
    }

    public function show(Paiement $paiement): JsonResponse
    {
        $this->authorize('view', $paiement);

        return response()->json(['data' => new PaiementResource($paiement->load('commande', 'client', 'personnel'))]);
    }

    public function valider(Paiement $paiement): JsonResponse
    {
        $this->authorize('valider', $paiement);

        $this->paiementService->valider($paiement);

        return response()->json(['message' => 'Paiement validé.', 'data' => new PaiementResource($paiement->fresh())]);
    }

    public function rejeter(Paiement $paiement): JsonResponse
    {
        $this->authorize('valider', $paiement);

        $this->paiementService->rejeter($paiement);

        return response()->json(['message' => 'Paiement rejeté.', 'data' => new PaiementResource($paiement->fresh())]);
    }
}
