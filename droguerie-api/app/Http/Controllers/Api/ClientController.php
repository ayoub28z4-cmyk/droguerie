<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct(private readonly ClientService $clientService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Client::class);

        $clients = Client::when($request->search, fn($q, $v) =>
                $q->where('nom', 'like', "%{$v}%")
                  ->orWhere('prenom', 'like', "%{$v}%")
                  ->orWhere('telephone', 'like', "%{$v}%"))
            ->when($request->type_client, fn($q, $v) => $q->where('type_client', $v))
            ->actif()
            ->orderBy('nom')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => ClientResource::collection($clients->items()),
            'meta' => [
                'total'        => $clients->total(),
                'per_page'     => $clients->perPage(),
                'current_page' => $clients->currentPage(),
                'last_page'    => $clients->lastPage(),
            ],
        ]);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $this->authorize('create', Client::class);

        $client = $this->clientService->creer($request->validated());

        return (new ClientResource($client))->response()->setStatusCode(201);
    }

    public function show(Client $client): JsonResponse
    {
        $this->authorize('view', $client);

        return response()->json(['data' => new ClientResource($client->load('account'))]);
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $this->authorize('update', $client);

        $client = $this->clientService->modifier($client, $request->validated());

        return response()->json(['data' => new ClientResource($client)]);
    }

    public function destroy(Client $client): JsonResponse
    {
        $this->authorize('delete', $client);

        $this->clientService->supprimer($client);

        return response()->json(null, 204);
    }
}
