<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginClientRequest;
use App\Http\Requests\Auth\RegisterClientRequest;
use App\Http\Resources\ClientResource;
use App\Services\AuthService;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientAuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly ClientService $clientService,
    ) {}

    public function register(RegisterClientRequest $request): JsonResponse
    {
        $client = $this->clientService->inscrire($request->validated());

        return response()->json([
            'message' => 'Inscription enregistrée. Votre compte sera activé après validation par l\'administrateur.',
            'data'    => new ClientResource($client),
        ], 201);
    }

    public function login(LoginClientRequest $request): JsonResponse
    {
        $result = $this->authService->loginClient(
            $request->email,
            $request->password
        );

        $account = $result['user']->load('client');

        return response()->json([
            'token'  => $result['token'],
            'client' => new ClientResource($account->client),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        return response()->json(['data' => new ClientResource($client)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logoutClient($request->user());

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }
}
