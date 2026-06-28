import { personnelApi } from '@/shared/api/personnelApi'
import type { Produit, ProduitFilters, PaginatedResponse } from '@/shared/types'

export const produitsApi = {
  list: (filters?: ProduitFilters) =>
    personnelApi.get<PaginatedResponse<Produit>>('/produits', { params: filters }),

  get: (id: number) =>
    personnelApi.get<{ data: Produit }>(`/produits/${id}`),

  create: (data: FormData) =>
    personnelApi.post<{ data: Produit }>('/produits', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: Partial<Produit>) =>
    personnelApi.put<{ data: Produit }>(`/produits/${id}`, data),

  delete: (id: number) =>
    personnelApi.delete(`/produits/${id}`),

  uploadImages: (id: number, files: File[]) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('images[]', f))
    return personnelApi.post<{ data: Produit }>(`/produits/${id}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage: (produitId: number, mediaId: number) =>
    personnelApi.delete(`/produits/${produitId}/images/${mediaId}`),
}
