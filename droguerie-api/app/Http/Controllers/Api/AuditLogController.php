<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('rapports.view');

        $logs = AuditLog::with('personnel')
            ->when($request->personnel_id, fn($q, $v) => $q->where('personnel_id', $v))
            ->when($request->action,        fn($q, $v) => $q->where('action', $v))
            ->when($request->date_debut,    fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_fin,      fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($request->search,        fn($q, $v) => $q->where('description', 'like', "%{$v}%"))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 50);

        return response()->json([
            'data' => $logs->map(fn($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'description' => $log->description,
                'model_type'  => $log->model_type,
                'model_id'    => $log->model_id,
                'metadata'    => $log->metadata,
                'created_at'  => $log->created_at?->toISOString(),
                'personnel'   => $log->personnel ? [
                    'id'     => $log->personnel->id,
                    'nom'    => $log->personnel->nom_complet,
                    'roles'  => $log->personnel->getRoleNames(),
                ] : null,
            ]),
            'meta' => [
                'total'        => $logs->total(),
                'per_page'     => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
            ],
        ]);
    }
}
