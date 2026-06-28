import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Input, FormField, SelectNative } from '@/shared/ui/FormField'
import { Modal, ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import type { Fournisseur, PaginatedResponse } from '@/shared/types'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  telephone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  ice: z.string().optional(),
  actif: z.boolean(),
})
type FormData = z.infer<typeof schema>

export function FournisseursPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editTarget, setEditTarget] = useState<Fournisseur | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['fournisseurs', { search, page }],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Fournisseur>>('/fournisseurs', {
        params: { search: search || undefined, page, per_page: 20 },
      }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData & { id?: number }) => {
      if (data.id) return personnelApi.put(`/fournisseurs/${data.id}`, data)
      return personnelApi.post('/fournisseurs', data)
    },
    onSuccess: () => {
      toast.success(editTarget === 'new' ? 'Fournisseur créé' : 'Fournisseur mis à jour')
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      setEditTarget(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => personnelApi.delete(`/fournisseurs/${id}`),
    onSuccess: () => {
      toast.success('Fournisseur supprimé')
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      setDeleteTarget(null)
    },
  })

  const columns: Column<Fournisseur>[] = [
    {
      key: 'nom',
      header: 'Fournisseur',
      accessor: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-ink-100 flex items-center justify-center">
            <Truck className="h-4 w-4 text-ink-500" />
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm">{f.nom}</p>
            {f.ville && <p className="text-xs text-ink-500">{f.ville}</p>}
          </div>
        </div>
      ),
    },
    { key: 'telephone', header: 'Téléphone', accessor: (f) => <span className="text-sm text-ink-600">{f.telephone ?? '—'}</span> },
    { key: 'email', header: 'Email', accessor: (f) => <span className="text-sm text-ink-600">{f.email ?? '—'}</span> },
    {
      key: 'solde_du',
      header: 'Solde dû',
      accessor: (f) => <MoneyDisplay amount={f.solde_du} size="sm" color={f.solde_du > 0 ? 'danger' : 'muted'} />,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'actions',
      header: '',
      accessor: (f) => (
        <div className="flex gap-1 justify-end">
          <Can perm="fournisseurs.update">
            <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditTarget(f) }}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </Can>
          <Can perm="fournisseurs.delete">
            <Button variant="ghost" size="icon-sm" className="text-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(f.id) }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Can>
        </div>
      ),
      width: 'w-20',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        description={`${data?.meta?.total ?? 0} fournisseurs`}
        actions={
          <Can perm="fournisseurs.create">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditTarget('new')}>
              Nouveau fournisseur
            </Button>
          </Can>
        }
      />
      <div className="mb-5">
        <Input
          placeholder="Rechercher un fournisseur..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(f) => f.id}
        emptyTitle="Aucun fournisseur"
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={20}
        onPageChange={setPage}
      />

      {editTarget !== null && (
        <FournisseurForm
          fournisseur={editTarget === 'new' ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(data) => saveMutation.mutate(editTarget === 'new' ? data : { ...data, id: (editTarget as Fournisseur).id })}
          loading={saveMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer le fournisseur"
        description="Confirmer la suppression ?"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </div>
  )
}

function FournisseurForm({
  fournisseur, onClose, onSubmit, loading,
}: {
  fournisseur: Fournisseur | null
  onClose: () => void
  onSubmit: (data: FormData) => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: fournisseur ? {
      nom: fournisseur.nom,
      telephone: fournisseur.telephone ?? '',
      email: fournisseur.email ?? '',
      adresse: fournisseur.adresse ?? '',
      ville: fournisseur.ville ?? '',
      ice: fournisseur.ice ?? '',
      actif: fournisseur.actif,
    } : { actif: true },
  })
  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={fournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nom" required error={errors.nom?.message} className="col-span-2">
            <Input {...register('nom')} error={!!errors.nom} />
          </FormField>
          <FormField label="Téléphone"><Input {...register('telephone')} /></FormField>
          <FormField label="Email"><Input type="email" {...register('email')} /></FormField>
          <FormField label="Adresse"><Input {...register('adresse')} /></FormField>
          <FormField label="Ville"><Input {...register('ville')} /></FormField>
          <FormField label="ICE"><Input {...register('ice')} /></FormField>
          <FormField label="Statut">
            <SelectNative {...register('actif', { setValueAs: (v) => v === 'true' || v === true })}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </SelectNative>
          </FormField>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={loading}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
