import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { Badge } from '@/shared/ui/Badge'
import { ConfirmDialog, Modal } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import { Input, FormField, SelectNative, Textarea } from '@/shared/ui/FormField'
import { formatDate } from '@/shared/lib/formatters'
import type { Inventaire, PaginatedResponse, Produit } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const ligneSchema = z.object({
  produit_id: z.coerce.number().min(1, 'Produit requis'),
  stock_reel: z.coerce.number().min(0, 'Stock réel requis'),
})

const inventaireSchema = z.object({
  date_inventaire: z.string().min(1, 'Date requise'),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema).min(1, 'Au moins une ligne requise'),
})
type InventaireFormData = z.infer<typeof inventaireSchema>

export function InventairesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['inventaires', page],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Inventaire>>('/inventaires', { params: { page, per_page: 15 } })
        .then((r) => r.data),
  })

  const validerMutation = useMutation({
    mutationFn: (id: number) => personnelApi.patch(`/inventaires/${id}/valider`),
    onSuccess: () => {
      toast.success('Inventaire validé')
      queryClient.invalidateQueries({ queryKey: ['inventaires'] })
      setConfirmTarget(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la validation')),
  })

  const createMutation = useMutation({
    mutationFn: (data: InventaireFormData) => personnelApi.post('/inventaires', data),
    onSuccess: () => {
      toast.success('Inventaire créé')
      queryClient.invalidateQueries({ queryKey: ['inventaires'] })
      setShowForm(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la création')),
  })

  const columns: Column<Inventaire>[] = [
    { key: 'id', header: 'N°', accessor: (inv) => <span className="font-mono text-xs font-semibold">{`INV-${String(inv.id).padStart(4, '0')}`}</span>, width: 'w-28' },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (inv) => (
        <Badge variant={inv.statut === 'valide' ? 'success' : 'default'} dot>
          {inv.statut === 'valide' ? 'Validé' : 'Brouillon'}
        </Badge>
      ),
    },
    { key: 'date', header: 'Date', accessor: (inv) => <span className="text-sm">{formatDate(inv.date_inventaire)}</span> },
    {
      key: 'lignes',
      header: 'Lignes',
      accessor: (inv) => <span className="text-sm font-medium">{inv.lignes?.length ?? 0}</span>,
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      key: 'ecarts',
      header: 'Écarts',
      accessor: (inv) => {
        const ecarts = inv.lignes?.filter((l) => l.ecart !== 0).length ?? 0
        return <span className={`text-sm font-medium ${ecarts > 0 ? 'text-warning' : 'text-success'}`}>{ecarts}</span>
      },
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      key: 'action',
      header: '',
      accessor: (inv) => inv.statut === 'brouillon' ? (
        <Can perm="inventaires.valider">
          <Button
            size="xs"
            variant="success"
            leftIcon={<CheckCircle className="h-3 w-3" />}
            onClick={(e) => { e.stopPropagation(); setConfirmTarget(inv.id) }}
          >
            Valider
          </Button>
        </Can>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventaires"
        description={`${data?.meta?.total ?? 0} inventaires`}
        actions={
          <Can perm="inventaires.create">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Nouvel inventaire</Button>
          </Can>
        }
      />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(inv) => inv.id}
        emptyTitle="Aucun inventaire"
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={15}
        onPageChange={setPage}
      />

      {showForm && (
        <InventaireForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Valider l'inventaire"
        description="La validation ajustera le stock selon les valeurs réelles saisies. Cette action est irréversible."
        confirmLabel="Valider l'inventaire"
        loading={validerMutation.isPending}
        onConfirm={() => confirmTarget && validerMutation.mutate(confirmTarget)}
      />
    </div>
  )
}

function InventaireForm({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void
  onSubmit: (data: InventaireFormData) => void
  loading: boolean
}) {
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
  } = useForm<InventaireFormData>({
    resolver: zodResolver(inventaireSchema),
    defaultValues: {
      date_inventaire: format(new Date(), 'yyyy-MM-dd'),
      lignes: [{ produit_id: 0, stock_reel: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title="Nouvel inventaire" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de l'inventaire" required error={errors.date_inventaire?.message}>
            <Input type="date" {...register('date_inventaire')} error={!!errors.date_inventaire} />
          </FormField>
          <FormField label="Notes" className="col-span-2">
            <Textarea {...register('notes')} rows={2} placeholder="Remarques..." />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-700">Produits à inventorier</span>
            <Button
              type="button"
              size="xs"
              variant="outline"
              leftIcon={<Plus className="h-3 w-3" />}
              onClick={() => append({ produit_id: 0, stock_reel: 0 })}
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
                <div className="col-span-8">
                  <SelectNative
                    {...register(`lignes.${idx}.produit_id`)}
                    error={!!errors.lignes?.[idx]?.produit_id}
                  >
                    <option value="">— Produit —</option>
                    {produits?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.designation} {p.stock_actuel !== undefined ? `(stock: ${p.stock_actuel})` : ''}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Stock réel"
                    {...register(`lignes.${idx}.stock_reel`)}
                    error={!!errors.lignes?.[idx]?.stock_reel}
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
          <Button type="submit" loading={loading}>Créer l'inventaire</Button>
        </div>
      </form>
    </Modal>
  )
}
