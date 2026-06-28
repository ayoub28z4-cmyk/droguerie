<?php

namespace App\Services;

use App\Models\Client;
use App\Models\ClientAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ClientService
{
    public function creer(array $data): Client
    {
        return DB::transaction(function () use ($data) {
            $client = Client::create($data);

            if (isset($data['email']) && isset($data['password'])) {
                ClientAccount::create([
                    'client_id' => $client->id,
                    'email'     => $data['email'],
                    'password'  => Hash::make($data['password']),
                ]);
            }

            return $client;
        });
    }

    public function modifier(Client $client, array $data): Client
    {
        $client->update($data);
        return $client->fresh();
    }

    public function supprimer(Client $client): void
    {
        $client->delete();
        $client->account?->delete();
    }
}
