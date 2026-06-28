import { personnelApi } from '@/shared/api/personnelApi'
import type { TableauDeBord } from '@/shared/types'

export const dashboardApi = {
  getTableauDeBord: () =>
    personnelApi.get<{ data: TableauDeBord }>('/rapports/tableau-de-bord'),
}
