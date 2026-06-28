<?php

namespace App\Services;

use App\Models\ClientAccount;
use App\Models\Personnel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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

        $token = $personnel->createToken('personnel-token', ['*'], now()->addDays(7))->plainTextToken;

        return ['token' => $token, 'user' => $personnel];
    }

    /** @return array{token: string, user: ClientAccount} */
    public function loginClient(string $email, string $password): array
    {
        $account = ClientAccount::with('client')
            ->where('email', $email)
            ->where('actif', true)
            ->first();

        if (! $account || ! Hash::check($password, $account->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $account->update(['last_login_at' => now()]);

        $token = $account->createToken('client-token', ['*'], now()->addDays(30))->plainTextToken;

        return ['token' => $token, 'user' => $account];
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
