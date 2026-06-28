<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Personnel\StorePersonnelRequest;
use App\Http\Requests\Personnel\UpdatePersonnelRequest;
use App\Http\Resources\PersonnelResource;
use App\Models\Personnel;
use App\Services\PersonnelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function __construct(private readonly PersonnelService $personnelService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Personnel::class);

        $personnels = Personnel::with('roles')
            ->when($request->search, fn($q, $v) =>
                $q->where('nom', 'like', "%{$v}%")->orWhere('email', 'like', "%{$v}%"))
            ->when($request->role, fn($q, $v) => $q->role($v))
            ->actif()
            ->orderBy('nom')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => PersonnelResource::collection($personnels->items()),
            'meta' => [
                'total'        => $personnels->total(),
                'per_page'     => $personnels->perPage(),
                'current_page' => $personnels->currentPage(),
                'last_page'    => $personnels->lastPage(),
            ],
        ]);
    }

    public function store(StorePersonnelRequest $request): JsonResponse
    {
        $this->authorize('create', Personnel::class);

        $personnel = $this->personnelService->creer($request->validated());

        return (new PersonnelResource($personnel->load('roles')))->response()->setStatusCode(201);
    }

    public function show(Personnel $personnel): JsonResponse
    {
        $this->authorize('view', $personnel);

        return response()->json(['data' => new PersonnelResource($personnel->load('roles'))]);
    }

    public function update(UpdatePersonnelRequest $request, Personnel $personnel): JsonResponse
    {
        $this->authorize('update', $personnel);

        $personnel = $this->personnelService->modifier($personnel, $request->validated());

        return response()->json(['data' => new PersonnelResource($personnel->load('roles'))]);
    }

    public function destroy(Personnel $personnel): JsonResponse
    {
        $this->authorize('delete', $personnel);

        $this->personnelService->supprimer($personnel);

        return response()->json(null, 204);
    }
}
