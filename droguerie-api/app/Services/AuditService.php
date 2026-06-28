<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public static function log(
        string $action,
        string $description,
        ?Model $model = null,
        array  $metadata = []
    ): void {
        AuditLog::create([
            'personnel_id' => auth('personnel')->id(),
            'action'       => $action,
            'description'  => $description,
            'model_type'   => $model ? class_basename($model) : null,
            'model_id'     => $model?->getKey(),
            'metadata'     => $metadata ?: null,
        ]);
    }
}
