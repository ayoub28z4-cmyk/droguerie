import { personnelApi } from '@/shared/api/personnelApi'
import type {
  Commande, CreateCommandePayload, CommandeFilters,
  Paiement, CreatePaiementPayload, PaginatedResponse
} from '@/shared/types'

export const commandesApi = {
  list: (filters?: CommandeFilters) =>
    personnelApi.get<PaginatedResponse<Commande>>('/commandes', { params: filters }),

  get: (id: number) =>
    personnelApi.get<{ data: Commande }>(`/commandes/${id}`),

  create: (payload: CreateCommandePayload) =>
    personnelApi.post<{ data: Commande }>('/commandes', payload),

  update: (id: number, payload: Partial<CreateCommandePayload>) =>
    personnelApi.put<{ data: Commande }>(`/commandes/${id}`, payload),

  transition: (id: number, action: string) =>
    personnelApi.patch<{ data: Commande }>(`/commandes/${id}/${action}`),

  // Paiements pour une commande
  createPaiement: (payload: CreatePaiementPayload) =>
    personnelApi.post<{ data: Paiement }>('/paiements', payload),

  validerPaiement: (paiementId: number) =>
    personnelApi.patch<{ data: Paiement }>(`/paiements/${paiementId}/valider`),
}
