<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Stock\AjusterStockRequest;
use App\Http\Resources\ProduitResource;
use App\Http\Resources\StockMouvementResource;
use App\Models\Produit;
use App\Models\StockMouvement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function mouvements(Request $request): JsonResponse
    {
        $this->authorize('stock.view');

        $mouvements = StockMouvement::with(['produit', 'personnel'])
            ->when($request->search, fn($q, $v) =>
                $q->whereHas('produit', fn($pq) => $pq->where('designation', 'like', "%{$v}%"))
            )
            ->when($request->produit_id, fn($q, $v) => $q->where('produit_id', $v))
            ->when($request->type_mouvement, fn($q, $v) => $q->where('type_mouvement', $v))
            ->when($request->date_debut, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_fin, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => StockMouvementResource::collection($mouvements->items()),
            'meta' => [
                'total'        => $mouvements->total(),
                'per_page'     => $mouvements->perPage(),
                'current_page' => $mouvements->currentPage(),
                'last_page'    => $mouvements->lastPage(),
            ],
        ]);
    }

    public function alertes(): JsonResponse
    {
        $this->authorize('stock.view');

        $produits = Produit::with('categorie')
            ->alerteStock()
            ->actif()
            ->orderBy('stock_actuel')
            ->get();

        $alertes = $produits->map(function (Produit $p) {
            $actuel  = (float) $p->stock_actuel;
            $minimum = (float) $p->stock_minimum;
            $type    = match (true) {
                $actuel <= 0            => 'rupture',
                $actuel <= $minimum * 0.5 => 'critique',
                default                 => 'faible',
            };

            return [
                'produit_id'   => $p->id,
                'produit'      => (new ProduitResource($p))->resolve(),
                'stock_actuel' => $actuel,
                'stock_minimum'=> $minimum,
                'type'         => $type,
            ];
        });

        return response()->json(['data' => $alertes]);
    }

    public function ajuster(AjusterStockRequest $request): JsonResponse
    {
        $this->authorize('stock.ajuster');

        $data = $request->validated();
        $mouvement = $this->stockService->ajuster(
            $data['produit_id'],
            $data['quantite'],
            \App\Enums\TypeMouvement::from($data['type_mouvement']),
            $data['motif'],
            $data['prix_unitaire'] ?? 0
        );

        return (new StockMouvementResource($mouvement->load('produit', 'personnel')))->response()->setStatusCode(201);
    }
}
