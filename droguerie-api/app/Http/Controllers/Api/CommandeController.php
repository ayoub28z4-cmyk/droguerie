<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Commande\StoreCommandeRequest;
use App\Http\Requests\Commande\UpdateCommandeRequest;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function __construct(private readonly CommandeService $commandeService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Commande::class);

        $user = $request->user();
        $isClient = $user instanceof \App\Models\ClientAccount;

        $commandes = Commande::with(['client', 'personnel'])
            ->when($isClient, fn($q) => $q->where('client_id', $user->client_id))
            ->when($request->search, function ($q, $v) {
                $q->where(function ($q2) use ($v) {
                    $q2->where('numero', 'like', "%{$v}%")
                       ->orWhereHas('client', fn($cq) => $cq
                           ->where('nom', 'like', "%{$v}%")
                           ->orWhere('prenom', 'like', "%{$v}%")
                           ->orWhere('telephone', 'like', "%{$v}%")
                           ->orWhere('email', 'like', "%{$v}%")
                       );
                });
            })
            ->when($request->statut, function ($q, $v) {
                if ($v === 'en_cours') {
                    return $q->whereIn('statut', ['en_attente', 'confirmee', 'en_preparation', 'en_livraison']);
                }
                return $q->where('statut', $v);
            })
            ->when($request->canal, fn($q, $v) => $q->where('canal', $v))
            ->when(! $isClient && $request->client_id, fn($q) => $q->where('client_id', $request->client_id))
            ->when($request->date_debut, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_fin, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => CommandeResource::collection($commandes->items()),
            'meta' => [
                'total'        => $commandes->total(),
                'per_page'     => $commandes->perPage(),
                'current_page' => $commandes->currentPage(),
                'last_page'    => $commandes->lastPage(),
            ],
        ]);
    }

    public function store(StoreCommandeRequest $request): JsonResponse
    {
        $this->authorize('create', Commande::class);

        $commande = $this->commandeService->creer($request->validated());

        return (new CommandeResource($commande))->response()->setStatusCode(201);
    }

    public function show(Commande $commande): JsonResponse
    {
        $this->authorize('view', $commande);

        $commande->load(['client', 'personnel', 'lignes.produit', 'paiements.personnel']);

        return response()->json(['data' => new CommandeResource($commande)]);
    }

    private function loadedCommande(Commande $commande): Commande
    {
        return $commande->load(['client', 'personnel', 'lignes.produit', 'paiements.personnel']);
    }

    public function update(UpdateCommandeRequest $request, Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $commande->update($request->validated());

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function confirmer(Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $this->commandeService->confirmer($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function mettreEnPreparation(Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $this->commandeService->mettreEnPreparation($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function mettreEnLivraison(Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $this->commandeService->mettreEnLivraison($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function marquerLivree(Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $this->commandeService->marquerLivree($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function cloturer(Commande $commande): JsonResponse
    {
        $this->authorize('update', $commande);

        $this->commandeService->cloturer($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }

    public function annuler(Commande $commande): JsonResponse
    {
        $this->authorize('annuler', $commande);

        $this->commandeService->annuler($commande);

        return response()->json(['data' => new CommandeResource($this->loadedCommande($commande->fresh()))]);
    }
}
