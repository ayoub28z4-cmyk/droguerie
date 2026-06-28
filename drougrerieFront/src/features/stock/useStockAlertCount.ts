import { useQuery } from '@tanstack/react-query'
import { personnelApi } from '@/shared/api/personnelApi'
import type { AlerteStock } from '@/shared/types'

export function useStockAlertCount() {
  return useQuery({
    queryKey: ['stock', 'alertes', 'count'],
    queryFn: async () => {
      const res = await personnelApi.get<{ data: AlerteStock[] }>('/stock/alertes')
      return res.data.data?.length ?? 0
    },
    refetchInterval: 5 * 60 * 1000,
    select: (count) => count,
  })
}
