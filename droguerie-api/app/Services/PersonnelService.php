<?php

namespace App\Services;

use App\Models\Personnel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PersonnelService
{
    public function creer(array $data): Personnel
    {
        return DB::transaction(function () use ($data) {
            $personnel = Personnel::create([
                'nom'       => $data['nom'],
                'prenom'    => $data['prenom'],
                'telephone' => $data['telephone'] ?? null,
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'actif'     => $data['actif'] ?? true,
            ]);

            if (! empty($data['roles'])) {
                $personnel->syncRoles($data['roles']);
            }

            return $personnel;
        });
    }

    public function modifier(Personnel $personnel, array $data): Personnel
    {
        return DB::transaction(function () use ($personnel, $data) {
            $updateData = array_filter([
                'nom'       => $data['nom'] ?? null,
                'prenom'    => $data['prenom'] ?? null,
                'telephone' => $data['telephone'] ?? null,
                'email'     => $data['email'] ?? null,
                'actif'     => $data['actif'] ?? null,
            ], fn($v) => $v !== null);

            if (! empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $personnel->update($updateData);

            if (isset($data['roles'])) {
                $personnel->syncRoles($data['roles']);
            }

            return $personnel->fresh();
        });
    }

    public function supprimer(Personnel $personnel): void
    {
        $personnel->delete();
    }
}
