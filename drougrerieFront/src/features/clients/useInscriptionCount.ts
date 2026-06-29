import { useQuery } from '@tanstack/react-query'
import { clientsApi } from './clientsApi'

export function useInscriptionCount() {
  return useQuery({
    queryKey: ['inscriptions', 'count'],
    queryFn: async () => {
      const res = await clientsApi.inscriptions({ statut: 'en_attente', per_page: 1 })
      return res.data.meta?.total ?? 0
    },
    refetchInterval: 2 * 60 * 1000,
  })
}
