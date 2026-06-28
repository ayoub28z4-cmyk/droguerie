import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowLeft, Check, Package, Truck } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card, CardTitle } from '@/shared/ui/Card'
import { ApproStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Modal, ConfirmDialog } from '@/shared/ui/Modal'
import { FormField, Input } from '@/shared/ui/FormField'
import { Can } from '@/shared/ui/Can'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import { formatDate, formatMoney, formatNumber } from '@/shared/lib/formatters'
import { getApiErrorMessage } from '@/shared/lib/apiError'
import type { Approvisionnement, ApproStatut } from '@/shared/types'

// ── Stepper ────────────────────────────────────────────────
const STEPS: { statut: ApproStatut; label: string }[] = [
  { statut: 'brouillon',   label: 'Brouillon' },
  { statut: 'commande',    label: 'Commandé' },
  { statut: 'en_transit',  label: 'En transit' },
  { statut: 'receptionne', label: 'Réceptionné' },
  { statut: 'valide',      label: 'Validé' },
]
const STEP_ORDER = STEPS.map((s) => s.statut)

function ApproStepper({ statut }: { statut: ApproStatut }) {
  const currentIndex = STEP_ORDER.indexOf(statut)
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {STEPS.map((step, index) => {
        const isDone    = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={step.statut} className="flex items-center min-w-0 flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                isDone    && 'bg-success border-success text-white',
                isCurrent && 'bg-brand-500 border-brand-500 text-white scale-110',
                !isDone && !isCurrent && 'bg-surface border-ink-300 text-ink-400'
              )}>
                {isDone ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap',
                isDone    && 'text-success font-medium',
                isCurrent && 'text-brand-600 font-semibold',
                !isDone && !isCurrent && 'text-ink-400'
              )}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mt-[-20px] rounded-full overflow-hidden bg-ink-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                  className="h-full bg-success rounded-full"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Formulaire réception ───────────────────────────────────
interface ReceptionForm {
  date_reception: string
  lignes: { id: number; quantite_recue: number; prix_achat_unitaire: number }[]
}

function ReceptionModal({
  appro,
  onClose,
  onSuccess,
}: {
  appro: Approvisionnement
  onClose: () => void
  onSuccess: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ReceptionForm>({
    defaultValues: {
      date_reception: new Date().toISOString().split('T')[0],
      lignes: appro.lignes.map((l) => ({
        id: l.id,
        quantite_recue: l.quantite_commandee,
        prix_achat_unitaire: l.prix_achat_unitaire,
      })),
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ReceptionForm) =>
      personnelApi.patch(`/approvisionnements/${appro.id}/receptionner`, data),
    onSuccess: () => {
      toast.success('Approvisionnement réceptionné')
      onSuccess()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la réception')),
  })

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="Réceptionner l'approvisionnement" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <FormField label="Date de réception" required>
          <Input type="date" {...register('date_reception', { required: true })} />
        </FormField>

        <div>
          <p className="text-sm font-medium text-ink-700 mb-3">Quantités reçues</p>
          <div className="space-y-3">
            {appro.lignes.map((ligne, idx) => (
              <div key={ligne.id} className="grid grid-cols-12 gap-3 items-center p-3 rounded-[10px] bg-ink-50">
                <input type="hidden" {...register(`lignes.${idx}.id`)} value={ligne.id} />
                <div className="col-span-5">
                  <p className="text-sm font-medium text-ink-900">{ligne.produit?.designation ?? `Produit #${ligne.produit_id}`}</p>
                  <p className="text-xs text-ink-400">Commandé : {formatNumber(ligne.quantite_commandee)} {ligne.produit?.unite ?? 'u.'}</p>
                </div>
                <div className="col-span-4">
                  <label className="text-xs text-ink-500 mb-1 block">Qté reçue</label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    {...register(`lignes.${idx}.quantite_recue`, { required: true, min: 0, valueAsNumber: true })}
                    error={!!errors.lignes?.[idx]?.quantite_recue}
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-ink-500 mb-1 block">Prix achat</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`lignes.${idx}.prix_achat_unitaire`, { valueAsNumber: true })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={mutation.isPending}>Confirmer la réception</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Page principale ────────────────────────────────────────
export function ApproDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showReception, setShowReception] = useState(false)
  const [showValider, setShowValider] = useState(false)

  const { data: appro, isLoading } = useQuery({
    queryKey: ['approvisionnements', Number(id)],
    queryFn: () =>
      personnelApi.get<{ data: Approvisionnement }>(`/approvisionnements/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  })

  const transitionMutation = useMutation({
    mutationFn: (endpoint: string) =>
      personnelApi.patch(`/approvisionnements/${id}/${endpoint}`),
    onSuccess: () => {
      toast.success('Statut mis à jour')
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] })
      setShowValider(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur')),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['approvisionnements'] })
    setShowReception(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-ink-200 rounded" />
        <div className="h-24 bg-ink-200 rounded-[var(--radius)]" />
        <div className="h-64 bg-ink-200 rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!appro) return null

  const canCommander   = appro.statut === 'brouillon'
  const canEnTransit   = appro.statut === 'commande'
  const canReceptionner = appro.statut === 'en_transit'
  const canValider     = appro.statut === 'receptionne'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/approvisionnements')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-bold text-ink-900">
              {appro.numero_bl ?? `Appro #${appro.id}`}
            </h1>
            <ApproStatusBadge statut={appro.statut} />
          </div>
          <p className="text-xs text-ink-500 mt-0.5">{formatDate(appro.created_at)}</p>
        </div>

        {/* Boutons de transition */}
        <div className="flex gap-2 flex-wrap">
          <Can perm="approvisionnements.create">
            {canCommander && (
              <Button
                size="sm"
                loading={transitionMutation.isPending}
                onClick={() => transitionMutation.mutate('commander')}
              >
                Commander
              </Button>
            )}
            {canEnTransit && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Truck className="h-3.5 w-3.5" />}
                loading={transitionMutation.isPending}
                onClick={() => transitionMutation.mutate('en-transit')}
              >
                Mettre en transit
              </Button>
            )}
            {canReceptionner && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Package className="h-3.5 w-3.5" />}
                onClick={() => setShowReception(true)}
              >
                Réceptionner
              </Button>
            )}
          </Can>
          <Can perm="approvisionnements.valider">
            {canValider && (
              <Button
                size="sm"
                variant="success"
                leftIcon={<Check className="h-3.5 w-3.5" />}
                loading={transitionMutation.isPending}
                onClick={() => setShowValider(true)}
              >
                Valider et mettre à jour le stock
              </Button>
            )}
          </Can>
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <ApproStepper statut={appro.statut} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lignes */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-4 border-b border-ink-100">
              <CardTitle>Lignes de commande</CardTitle>
            </div>
            <div className="divide-y divide-ink-100">
              {appro.lignes.map((ligne) => {
                const recu    = ligne.quantite_recue ?? 0
                const cmd     = ligne.quantite_commandee
                const pct     = cmd > 0 ? Math.min((recu / cmd) * 100, 100) : 0
                const complet = recu >= cmd

                return (
                  <div key={ligne.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-[8px] bg-ink-100 flex-shrink-0 flex items-center justify-center">
                      <Package className="h-4 w-4 text-ink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {ligne.produit?.designation ?? `Produit #${ligne.produit_id}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', complet ? 'bg-success' : 'bg-brand-500')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-500 whitespace-nowrap">
                          {appro.statut === 'brouillon' || appro.statut === 'commande' || appro.statut === 'en_transit'
                            ? `${formatNumber(cmd)} ${ligne.produit?.unite ?? 'u.'} commandé`
                            : `${formatNumber(recu)} / ${formatNumber(cmd)} ${ligne.produit?.unite ?? 'u.'}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-ink-900">{formatMoney(ligne.total_ht)}</p>
                      <p className="text-xs text-ink-400">{formatMoney(ligne.prix_achat_unitaire)} / u.</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-ink-200 px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-ink-600">Total HT</span>
              <MoneyDisplay amount={appro.montant_total} size="lg" />
            </div>
          </Card>
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Fournisseur</CardTitle>
            {appro.fournisseur ? (
              <div className="space-y-1.5">
                <p className="font-semibold text-ink-900">{appro.fournisseur.nom}</p>
                {appro.fournisseur.telephone && <p className="text-sm text-ink-600">{appro.fournisseur.telephone}</p>}
                {appro.fournisseur.email && <p className="text-sm text-ink-500">{appro.fournisseur.email}</p>}
              </div>
            ) : (
              <p className="text-sm text-ink-400">—</p>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-3">Détails</CardTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Créé par</dt>
                <dd className="font-medium text-ink-900">
                  {appro.personnel
                    ? `${appro.personnel.prenom ?? ''} ${appro.personnel.nom}`.trim()
                    : '—'}
                </dd>
              </div>
              {appro.date_reception && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Date réception</dt>
                  <dd className="font-medium text-ink-900">{formatDate(appro.date_reception)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Lignes</dt>
                <dd className="font-medium text-ink-900">{appro.lignes.length} produit(s)</dd>
              </div>
              {appro.notes && (
                <div>
                  <dt className="text-ink-500 mb-1">Notes</dt>
                  <dd className="text-ink-700 text-xs bg-ink-50 rounded-[8px] p-2">{appro.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {appro.statut === 'valide' && (
            <Card>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-success">Stock mis à jour</p>
                  <p className="text-xs text-ink-500">Les quantités reçues ont été ajoutées au stock</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal réception */}
      {showReception && appro && (
        <ReceptionModal
          appro={appro}
          onClose={() => setShowReception(false)}
          onSuccess={invalidate}
        />
      )}

      {/* Confirm valider */}
      <ConfirmDialog
        open={showValider}
        onOpenChange={(o) => !o && setShowValider(false)}
        title="Valider l'approvisionnement"
        description="Cette action va mettre à jour le stock avec les quantités reçues. Elle est irréversible."
        confirmLabel="Valider et mettre à jour le stock"
        loading={transitionMutation.isPending}
        onConfirm={() => transitionMutation.mutate('valider')}
      />
    </div>
  )
}
