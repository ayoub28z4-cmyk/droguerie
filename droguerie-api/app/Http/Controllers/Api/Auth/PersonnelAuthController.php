<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginPersonnelRequest;
use App\Http\Resources\PersonnelResource;
use App\Models\AuditLog;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PersonnelAuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginPersonnelRequest $request): JsonResponse
    {
        $result = $this->authService->loginPersonnel(
            $request->email,
            $request->password
        );

        $personnel = $result['user']->load('roles');

        AuditLog::create([
            'personnel_id' => $personnel->id,
            'action'       => 'connexion',
            'description'  => "{$personnel->prenom} {$personnel->nom} s'est connecté",
        ]);

        return response()->json([
            'token'       => $result['token'],
            'personnel'   => new PersonnelResource($personnel),
            'permissions' => $personnel->getAllPermissions()->pluck('name'),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new PersonnelResource($request->user()->load('roles')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logoutPersonnel($request->user());

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }
}
