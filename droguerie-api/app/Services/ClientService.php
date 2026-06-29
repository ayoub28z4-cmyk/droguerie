<?php

namespace App\Services;

use App\Enums\StatutInscription;
use App\Models\Client;
use App\Models\ClientAccount;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ClientService
{
    public function creer(array $data): Client
    {
        try {
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
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'email' => ['Cet email, téléphone ou ICE est déjà utilisé par un autre client.'],
            ]);
        }
    }

    public function inscrire(array $data): Client
    {
        try {
            return DB::transaction(function () use ($data) {
                $client = Client::create([
                    'nom'                => $data['nom'],
                    'prenom'             => $data['prenom'] ?? null,
                    'telephone'          => $data['telephone'],
                    'email'              => $data['email'],
                    'adresse'            => $data['adresse'] ?? null,
                    'ville'              => $data['ville'] ?? null,
                    'ice'                => $data['ice'] ?? null,
                    'type_client'        => $data['type_client'],
                    'actif'              => false,
                    'statut_inscription' => StatutInscription::EnAttente,
                ]);

                ClientAccount::create([
                    'client_id' => $client->id,
                    'email'     => $data['email'],
                    'password'  => Hash::make($data['password']),
                    'actif'     => false,
                ]);

                return $client;
            });
        } catch (UniqueConstraintViolationException) {
            // Race condition : deux requêtes simultanées avec le même email/telephone/ice
            throw ValidationException::withMessages([
                'email' => ['Cet email ou ce numéro est déjà utilisé. Veuillez vérifier vos informations.'],
            ]);
        }
    }

    public function validerInscription(Client $client): Client
    {
        return DB::transaction(function () use ($client) {
            // Verrou exclusif : empêche la double-validation concurrente
            $client = Client::lockForUpdate()->findOrFail($client->id);

            if ($client->statut_inscription !== StatutInscription::EnAttente) {
                throw ValidationException::withMessages([
                    'statut' => ['Ce client a déjà été traité (statut : ' . $client->statut_inscription?->label() . ').'],
                ]);
            }

            $client->update([
                'actif'              => true,
                'statut_inscription' => StatutInscription::Valide,
                'motif_rejet'        => null,
            ]);

            $client->account?->update(['actif' => true]);

            return $client->fresh('account');
        });
    }

    public function rejeterInscription(Client $client, ?string $motif): Client
    {
        return DB::transaction(function () use ($client, $motif) {
            $client = Client::lockForUpdate()->findOrFail($client->id);

            if ($client->statut_inscription !== StatutInscription::EnAttente) {
                throw ValidationException::withMessages([
                    'statut' => ['Ce client a déjà été traité (statut : ' . $client->statut_inscription?->label() . ').'],
                ]);
            }

            $client->update([
                'statut_inscription' => StatutInscription::Rejete,
                'motif_rejet'        => $motif,
            ]);

            return $client->fresh();
        });
    }

    public function modifier(Client $client, array $data): Client
    {
        return DB::transaction(function () use ($client, $data) {
            $client->update($data);

            // Synchroniser l'email du compte si l'email client change
            if (isset($data['email']) && $client->account && $client->account->email !== $data['email']) {
                $client->account->update(['email' => $data['email']]);
            }

            return $client->fresh('account');
        });
    }

    public function supprimer(Client $client): void
    {
        DB::transaction(function () use ($client) {
            // Supprimer le compte en premier (évite l'orphelin si le softDelete échoue)
            $client->account?->delete();
            $client->delete();
        });
    }
}
