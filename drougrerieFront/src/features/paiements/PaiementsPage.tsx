import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { PaiementStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Button } from '@/shared/ui/Button'
import { ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import { formatDateTime } from '@/shared/lib/formatters'
import type { Paiement, PaginatedResponse } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const MODE_LABELS = { especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', credit: 'Crédit' }

export function PaiementsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: 'valider' | 'rejeter' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['paiements', { page }],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Paiement>>('/paiements', { params: { page, per_page: 20 } })
        .then((r) => r.data),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      personnelApi.patch(`/paiements/${id}/${action}`),
    onSuccess: (_, vars) => {
      toast.success(vars.action === 'valider' ? 'Paiement validé' : 'Paiement rejeté')
      queryClient.invalidateQueries({ queryKey: ['paiements'] })
      setConfirmTarget(null)
    },
    onError: () => toast.error('Erreur lors de l\'action'),
  })

  const columns: Column<Paiement>[] = [
    {
      key: 'commande',
      header: 'Commande',
      accessor: (p) => (
        <button
          className="font-mono text-xs font-semibold text-accent-600 hover:underline"
          onClick={(e) => { e.stopPropagation(); navigate(`/commandes/${p.commande_id}`) }}
        >
          {p.commande?.numero ?? `#${p.commande_id}`}
        </button>
      ),
    },
    {
      key: 'montant',
      header: 'Montant',
      accessor: (p) => <MoneyDisplay amount={p.montant} size="sm" />,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'mode',
      header: 'Mode',
      accessor: (p) => <span className="text-sm text-ink-700">{MODE_LABELS[p.mode_paiement]}</span>,
    },
    {
      key: 'reference',
      header: 'Référence',
      accessor: (p) => <span className="text-xs text-ink-500">{p.reference ?? '—'}</span>,
    },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (p) => <PaiementStatusBadge statut={p.statut} />,
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (p) => <span className="text-xs text-ink-500">{formatDateTime(p.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      accessor: (p) => p.statut === 'en_attente' ? (
        <div className="flex gap-1 justify-end">
          <Can perm="paiements.valider">
            <Button
              variant="ghost" size="icon-sm"
              className="text-success"
              onClick={(e) => { e.stopPropagation(); setConfirmTarget({ id: p.id, action: 'valider' }) }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon-sm"
              className="text-danger"
              onClick={(e) => { e.stopPropagation(); setConfirmTarget({ id: p.id, action: 'rejeter' }) }}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </Can>
        </div>
      ) : null,
      width: 'w-20',
    },
  ]

  return (
    <div>
      <PageHeader title="Paiements" description={`${data?.meta?.total ?? 0} paiements`} />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(p) => p.id}
        emptyTitle="Aucun paiement"
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={20}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget?.action === 'valider' ? 'Valider le paiement' : 'Rejeter le paiement'}
        description={confirmTarget?.action === 'valider'
          ? 'Confirmer la validation de ce paiement ?'
          : 'Êtes-vous sûr de vouloir rejeter ce paiement ?'}
        variant={confirmTarget?.action === 'rejeter' ? 'danger' : 'primary'}
        confirmLabel={confirmTarget?.action === 'valider' ? 'Valider' : 'Rejeter'}
        loading={actionMutation.isPending}
        onConfirm={() => confirmTarget && actionMutation.mutate(confirmTarget)}
      />
    </div>
  )
}
