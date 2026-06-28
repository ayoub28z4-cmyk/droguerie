<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RapportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class RapportController extends Controller
{
    public function __construct(private readonly RapportService $rapportService) {}

    public function tableauDeBord(Request $request): JsonResponse
    {
        $this->authorize('rapports.view');

        return response()->json(['data' => $this->rapportService->tableauDeBord()]);
    }

    public function chiffreAffaires(Request $request): JsonResponse
    {
        $request->validate([
            'date_debut' => ['required', 'date'],
            'date_fin'   => ['required', 'date', 'after_or_equal:date_debut'],
        ]);

        $this->authorize('rapports.view');

        $data = $this->rapportService->chiffreAffairesPeriode(
            Carbon::parse($request->date_debut),
            Carbon::parse($request->date_fin)
        );

        return response()->json(['data' => $data]);
    }

    public function topProduits(Request $request): JsonResponse
    {
        $this->authorize('rapports.view');

        $request->validate([
            'date_debut' => ['nullable', 'date'],
            'date_fin'   => ['nullable', 'date'],
            'limite'     => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $data = $this->rapportService->topProduits(
            $request->limite ?? 10,
            $request->date_debut ? Carbon::parse($request->date_debut) : null,
            $request->date_fin ? Carbon::parse($request->date_fin) : null,
        );

        return response()->json(['data' => $data]);
    }

    public function mouvementsStock(Request $request): JsonResponse
    {
        $request->validate([
            'produit_id' => ['required', 'exists:produits,id'],
            'date_debut' => ['required', 'date'],
            'date_fin'   => ['required', 'date', 'after_or_equal:date_debut'],
        ]);

        $this->authorize('rapports.view');

        $mouvements = $this->rapportService->mouvementsStock(
            $request->produit_id,
            Carbon::parse($request->date_debut),
            Carbon::parse($request->date_fin)
        );

        return response()->json([
            'data' => \App\Http\Resources\StockMouvementResource::collection($mouvements),
        ]);
    }
}
