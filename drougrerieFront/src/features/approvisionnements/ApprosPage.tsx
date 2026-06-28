import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, ChevronRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { ApproStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { ConfirmDialog, Modal } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import { Input, FormField, SelectNative, Textarea } from '@/shared/ui/FormField'
import { formatDate } from '@/shared/lib/formatters'
import type { Approvisionnement, ApproStatut, PaginatedResponse, Fournisseur, Produit } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const ligneSchema = z.object({
  produit_id: z.coerce.number().min(1, 'Produit requis'),
  quantite_commandee: z.coerce.number().min(0.001, 'Quantité requise'),
  prix_achat_unitaire: z.coerce.number().min(0, 'Prix requis'),
})

const approSchema = z.object({
  fournisseur_id: z.coerce.number().min(1, 'Fournisseur requis'),
  numero_bl: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema).min(1, 'Au moins une ligne requise'),
})
type ApproFormData = z.infer<typeof approSchema>

const TRANSITIONS: Record<ApproStatut, { label: string; endpoint: string; confirm?: string } | null> = {
  brouillon:   { label: 'Commander', endpoint: 'commander' },
  commande:    { label: 'Mettre en transit', endpoint: 'en-transit' },
  en_transit:  { label: 'Réceptionner', endpoint: 'receptionner' },
  receptionne: { label: 'Valider', endpoint: 'valider', confirm: 'Valider définitivement cet approvisionnement ?' },
  valide:      null,
}

export function ApprosPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; endpoint: string; label: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['approvisionnements', page],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Approvisionnement>>('/approvisionnements', { params: { page, per_page: 15 } })
        .then((r) => r.data),
  })

  const transitionMutation = useMutation({
    mutationFn: ({ id, endpoint }: { id: number; endpoint: string }) =>
      personnelApi.patch(`/approvisionnements/${id}/${endpoint}`),
    onSuccess: () => {
      toast.success('Statut mis à jour')
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] })
      setConfirmTarget(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur')),
  })

  const createMutation = useMutation({
    mutationFn: (data: ApproFormData) => personnelApi.post('/approvisionnements', data),
    onSuccess: () => {
      toast.success('Approvisionnement créé')
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] })
      setShowForm(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la création')),
  })

  const columns: Column<Approvisionnement>[] = [
    { key: 'numero_bl', header: 'N° BL', accessor: (a) => <span className="font-mono text-xs font-semibold">{a.numero_bl ?? `BL-${a.id}`}</span>, width: 'w-28' },
    { key: 'fournisseur', header: 'Fournisseur', accessor: (a) => <p className="text-sm font-medium text-ink-900">{a.fournisseur?.nom ?? '—'}</p> },
    { key: 'statut', header: 'Statut', accessor: (a) => <ApproStatusBadge statut={a.statut} /> },
    {
      key: 'montant_total',
      header: 'Montant',
      accessor: (a) => <MoneyDisplay amount={a.montant_total} size="sm" />,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    { key: 'date', header: 'Date', accessor: (a) => <span className="text-xs text-ink-500">{formatDate(a.created_at)}</span> },
    {
      key: 'action',
      header: '',
      accessor: (a) => {
        const trans = TRANSITIONS[a.statut]
        if (!trans) return null
        return (
          <Can perm="approvisionnements.update">
            <Button
              size="xs"
              variant="outline"
              rightIcon={<ChevronRight className="h-3 w-3" />}
              onClick={(e) => {
                e.stopPropagation()
                if (trans.confirm) setConfirmTarget({ id: a.id, endpoint: trans.endpoint, label: trans.label })
                else transitionMutation.mutate({ id: a.id, endpoint: trans.endpoint })
              }}
            >
              {trans.label}
            </Button>
          </Can>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Approvisionnements"
        description={`${data?.meta?.total ?? 0} approvisionnements`}
        actions={
          <Can perm="approvisionnements.create">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Nouvel appro.</Button>
          </Can>
        }
      />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(a) => a.id}
        emptyTitle="Aucun approvisionnement"
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={15}
        onPageChange={setPage}
        onRowClick={(a) => navigate(`/approvisionnements/${a.id}`)}
      />

      {showForm && (
        <ApproForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget?.label ?? ''}
        description={TRANSITIONS[confirmTarget ? (data?.data?.find((a) => a.id === confirmTarget.id)?.statut ?? 'brouillon') : 'brouillon']?.confirm ?? 'Confirmer ?'}
        loading={transitionMutation.isPending}
        onConfirm={() => confirmTarget && transitionMutation.mutate(confirmTarget)}
      />
    </div>
  )
}

function ApproForm({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void
  onSubmit: (data: ApproFormData) => void
  loading: boolean
}) {
  const { data: fournisseurs } = useQuery({
    queryKey: ['fournisseurs', 'all'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Fournisseur>>('/fournisseurs', { params: { per_page: 200 } })
        .then((r) => r.data.data),
  })

  const { data: produits } = useQuery({
    queryKey: ['produits', 'all'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Produit>>('/produits', { params: { per_page: 500 } })
        .then((r) => r.data.data),
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApproFormData>({
    resolver: zodResolver(approSchema),
    defaultValues: { lignes: [{ produit_id: 0, quantite_commandee: 1, prix_achat_unitaire: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title="Nouvel approvisionnement" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fournisseur" required error={errors.fournisseur_id?.message} className="col-span-2 sm:col-span-1">
            <SelectNative {...register('fournisseur_id')} error={!!errors.fournisseur_id}>
              <option value="">— Sélectionner —</option>
              {fournisseurs?.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </SelectNative>
          </FormField>
          <FormField label="N° Bon de livraison" className="col-span-2 sm:col-span-1">
            <Input {...register('numero_bl')} placeholder="Ex: BL-2024-001" />
          </FormField>
          <FormField label="Notes" className="col-span-2">
            <Textarea {...register('notes')} rows={2} placeholder="Remarques, instructions..." />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-700">Lignes de commande</span>
            <Button
              type="button"
              size="xs"
              variant="outline"
              leftIcon={<Plus className="h-3 w-3" />}
              onClick={() => append({ produit_id: 0, quantite_commandee: 1, prix_achat_unitaire: 0 })}
            >
              Ajouter
            </Button>
          </div>
          {errors.lignes && typeof errors.lignes.message === 'string' && (
            <p className="text-xs text-danger mb-2">{errors.lignes.message}</p>
          )}
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <SelectNative
                    {...register(`lignes.${idx}.produit_id`)}
                    error={!!errors.lignes?.[idx]?.produit_id}
                  >
                    <option value="">— Produit —</option>
                    {produits?.map((p) => (
                      <option key={p.id} value={p.id}>{p.designation}</option>
                    ))}
                  </SelectNative>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="Qté"
                    {...register(`lignes.${idx}.quantite_commandee`)}
                    error={!!errors.lignes?.[idx]?.quantite_commandee}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Prix achat"
                    {...register(`lignes.${idx}.prix_achat_unitaire`)}
                    error={!!errors.lignes?.[idx]?.prix_achat_unitaire}
                  />
                </div>
                <div className="col-span-1 flex justify-end pt-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={loading}>Créer l'approvisionnement</Button>
        </div>
      </form>
    </Modal>
  )
}
