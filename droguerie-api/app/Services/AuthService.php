<?php

namespace App\Services;

use App\Enums\StatutInscription;
use App\Models\ClientAccount;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    /** @return array{token: string, user: Personnel} */
    public function loginPersonnel(string $email, string $password): array
    {
        $personnel = Personnel::where('email', $email)->where('actif', true)->first();

        if (! $personnel || ! Hash::check($password, $personnel->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        return DB::transaction(function () use ($personnel) {
            PersonalAccessToken::where('tokenable_type', $personnel->getMorphClass())
                ->where('tokenable_id', $personnel->id)
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->delete();

            $token = $personnel->createToken('personnel-token', ['*'], now()->addDays(7))->plainTextToken;

            return ['token' => $token, 'user' => $personnel];
        });
    }

    /** @return array{token: string, user: ClientAccount} */
    public function loginClient(string $email, string $password): array
    {
        $account = ClientAccount::with('client')
            ->where('email', $email)
            ->first();

        if (! $account || ! Hash::check($password, $account->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $statut = $account->client?->statut_inscription;

        if ($statut === StatutInscription::EnAttente) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte est en attente de validation par l\'administrateur.'],
            ]);
        }

        if ($statut === StatutInscription::Rejete) {
            throw ValidationException::withMessages([
                'email' => ['Votre demande d\'inscription a été rejetée. Contactez l\'administrateur.'],
            ]);
        }

        if (! $account->actif) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé.'],
            ]);
        }

        return DB::transaction(function () use ($account) {
            PersonalAccessToken::where('tokenable_type', $account->getMorphClass())
                ->where('tokenable_id', $account->id)
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->delete();

            $account->update(['last_login_at' => now()]);

            $token = $account->createToken('client-token', ['*'], now()->addDays(30))->plainTextToken;

            return ['token' => $token, 'user' => $account];
        });
    }

    public function logoutPersonnel(Personnel $personnel): void
    {
        $personnel->currentAccessToken()->delete();
    }

    public function logoutClient(ClientAccount $account): void
    {
        $account->currentAccessToken()->delete();
    }
}
