import { personnelApi } from '@/shared/api/personnelApi'
import type { Client, PaginatedResponse } from '@/shared/types'

export const clientsApi = {
  list: (params?: { search?: string; page?: number; per_page?: number }) =>
    personnelApi.get<PaginatedResponse<Client>>('/clients', { params }),

  get: (id: number) =>
    personnelApi.get<{ data: Client }>(`/clients/${id}`),

  create: (data: Partial<Client>) =>
    personnelApi.post<{ data: Client }>('/clients', data),

  update: (id: number, data: Partial<Client>) =>
    personnelApi.put<{ data: Client }>(`/clients/${id}`, data),

  delete: (id: number) =>
    personnelApi.delete(`/clients/${id}`),

  // Inscriptions en attente de validation
  inscriptions: (params?: { statut?: string; search?: string; page?: number; per_page?: number }) =>
    personnelApi.get<PaginatedResponse<Client>>('/clients/inscriptions', { params }),

  validerInscription: (id: number) =>
    personnelApi.patch<{ message: string; data: Client }>(`/clients/${id}/valider-inscription`),

  rejeterInscription: (id: number, motif?: string) =>
    personnelApi.patch<{ message: string; data: Client }>(`/clients/${id}/rejeter-inscription`, { motif }),
}
