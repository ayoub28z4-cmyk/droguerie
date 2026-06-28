<?php

namespace App\Services;

use App\Enums\StatutPaiement;
use App\Models\Client;
use App\Models\Commande;
use App\Models\Paiement;
use App\Notifications\PaiementRecuNotification;
use Illuminate\Support\Facades\DB;

class PaiementService
{
    public function __construct(private readonly CommandeService $commandeService) {}

    public function enregistrer(array $data): Paiement
    {
        return DB::transaction(function () use ($data) {
            $commande = Commande::findOrFail($data['commande_id']);

            $paiement = Paiement::create([
                'commande_id'   => $commande->id,
                'client_id'     => $commande->client_id,
                'personnel_id'  => auth('personnel')->id(),
                'montant'       => $data['montant'],
                'mode_paiement' => $data['mode_paiement'],
                'statut'        => StatutPaiement::EnAttente,
                'reference'     => $data['reference'] ?? null,
                'notes'         => $data['notes'] ?? null,
            ]);

            return $paiement;
        });
    }

    public function valider(Paiement $paiement): void
    {
        DB::transaction(function () use ($paiement) {
            $paiement->update([
                'statut'  => StatutPaiement::Valide,
                'paid_at' => now(),
            ]);

            $commande = $paiement->commande;
            $totalPaye = $commande->paiements()
                ->where('statut', StatutPaiement::Valide)
                ->sum('montant');

            $commande->update([
                'montant_paye'  => $totalPaye,
                'reste_a_payer' => max(0, (float) $commande->montant_ttc - $totalPaye),
            ]);

            // lockForUpdate() : évite la race condition si deux paiements sont validés simultanément
            $client = Client::lockForUpdate()->findOrFail($commande->client_id);
            $deduction = min((float) $paiement->montant, (float) $client->solde_du);
            if ($deduction > 0) {
                $client->decrement('solde_du', $deduction);
            }

            $client->account?->notify(new PaiementRecuNotification($paiement));

            $this->commandeService->cloturerSiPayee($commande->fresh());
        });
    }

    public function rejeter(Paiement $paiement): void
    {
        // Fix 3 : un paiement déjà validé ne peut pas être rejeté — il faudrait un remboursement.
        if ($paiement->statut === StatutPaiement::Valide) {
            throw new \DomainException(
                'Un paiement validé ne peut pas être rejeté directement. ' .
                'Créez un avoir ou un remboursement pour corriger la situation.'
            );
        }

        $paiement->update(['statut' => StatutPaiement::Rejete]);
    }
}
