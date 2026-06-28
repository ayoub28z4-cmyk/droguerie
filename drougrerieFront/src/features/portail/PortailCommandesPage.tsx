import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { clientApi } from '@/shared/api/clientApi'
import { CommandeStatusBadge } from '@/shared/ui/Badge'
import { CommandeStepper } from '@/shared/ui/Stepper'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/Modal'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatDateTime } from '@/shared/lib/formatters'
import type { Commande, PaginatedResponse } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

export function PortailCommandesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['portail', 'commandes', page],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Commande>>('/commandes', { params: { page, per_page: 10 } })
        .then((r) => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => clientApi.patch(`/commandes/${id}/annuler`),
    onSuccess: () => {
      toast.success('Commande annulée')
      queryClient.invalidateQueries({ queryKey: ['portail', 'commandes'] })
      setCancelTarget(null)
    },
    onError: () => toast.error('Impossible d\'annuler cette commande'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Mes commandes</h1>
          <p className="text-ink-500 mt-0.5">Suivez l'avancement de vos commandes</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/portail/commandes/nouvelle')}
        >
          Passer une commande
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius)] bg-surface border border-ink-200 p-5 animate-pulse">
              <div className="h-5 w-40 bg-ink-200 rounded mb-4" />
              <div className="h-10 bg-ink-100 rounded" />
            </div>
          ))}
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <EmptyState
          title="Aucune commande"
          description="Vous n'avez pas encore passé de commande."
          action={<Button onClick={() => navigate('/portail/commandes/nouvelle')}>Passer une commande</Button>}
        />
      ) : (
        <div className="space-y-4">
          {(data?.data ?? []).map((commande, index) => (
            <motion.div
              key={commande.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-ink-900">{commande.numero}</span>
                      <CommandeStatusBadge statut={commande.statut} />
                    </div>
                    <p className="text-xs text-ink-400 mt-0.5">{formatDateTime(commande.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <MoneyDisplay amount={commande.montant_ttc} size="md" />
                  </div>
                </div>

                <CommandeStepper statut={commande.statut} />

                {commande.montant_ttc > 0 && (
                  <div className="mt-3 pt-3 border-t border-ink-100">
                    <ProgressBar
                      value={commande.montant_paye}
                      max={commande.montant_ttc}
                      label="Paiement"
                      showPercent
                      color={commande.reste_a_payer === 0 ? 'success' : 'brand'}
                      size="sm"
                    />
                  </div>
                )}

                {commande.statut === 'en_attente' && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      onClick={() => setCancelTarget(commande.id)}
                    >
                      Annuler la commande
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="flex items-center px-3 text-sm text-ink-600">
            {page} / {data.meta.last_page}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage(page + 1)}>
            Suivant
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Annuler la commande"
        description="Êtes-vous sûr de vouloir annuler cette commande ?"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
      />
    </div>
  )
}
