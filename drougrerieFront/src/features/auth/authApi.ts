import { personnelApi } from '@/shared/api/personnelApi'
import { clientAuthApi } from '@/shared/api/clientApi'
import type { PersonnelAuthResponse, ClientAuthResponse, Personnel, Client } from '@/shared/types'

export const authApi = {
  personnelLogin: (email: string, password: string) =>
    personnelApi.post<PersonnelAuthResponse>('/personnel/auth/login', { email, password }),

  personnelMe: () =>
    personnelApi.get<{ data: Personnel }>('/personnel/auth/me'),

  personnelLogout: () =>
    personnelApi.post('/personnel/auth/logout'),

  clientRegister: (data: {
    nom: string
    prenom?: string
    telephone: string
    email: string
    password: string
    password_confirmation: string
    adresse?: string
    ville?: string
    ice?: string
    type_client: string
  }) =>
    clientAuthApi.post<{ message: string; data: Client }>('/client/auth/register', data),

  clientLogin: (email: string, password: string) =>
    clientAuthApi.post<ClientAuthResponse>('/client/auth/login', { email, password }),

  clientMe: () =>
    clientAuthApi.get<{ data: ClientAuthResponse['client'] }>('/client/auth/me'),

  clientLogout: () =>
    clientAuthApi.post('/client/auth/logout'),
}
