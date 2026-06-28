import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Tags } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { FormField, Input, Textarea } from '@/shared/ui/FormField'
import { Modal, ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import type { Categorie, PaginatedResponse } from '@/shared/types'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [editTarget, setEditTarget] = useState<Categorie | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Categorie>>('/categories', { params: { per_page: 100 } })
        .then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData & { id?: number }) => {
      if (data.id) return personnelApi.put(`/categories/${data.id}`, data)
      return personnelApi.post('/categories', data)
    },
    onSuccess: () => {
      toast.success(editTarget === 'new' ? 'Catégorie créée' : 'Catégorie mise à jour')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditTarget(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => personnelApi.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Catégorie supprimée')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTarget(null)
    },
  })

  const columns: Column<Categorie>[] = [
    {
      key: 'nom',
      header: 'Catégorie',
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-brand-100 flex items-center justify-center">
            <Tags className="h-3.5 w-3.5 text-brand-600" />
          </div>
          <span className="font-medium text-ink-900 text-sm">{c.nom}</span>
        </div>
      ),
    },
    { key: 'description', header: 'Description', accessor: (c) => <span className="text-sm text-ink-500">{c.description ?? '—'}</span> },
    {
      key: 'produits_count',
      header: 'Produits',
      accessor: (c) => <span className="text-sm font-medium text-ink-700">{c.produits_count ?? 0}</span>,
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      key: 'actions',
      header: '',
      accessor: (c) => (
        <div className="flex gap-1 justify-end">
          <Can perm="categories.update">
            <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditTarget(c) }}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </Can>
          <Can perm="categories.delete">
            <Button variant="ghost" size="icon-sm" className="text-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(c.id) }}>
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
        title="Catégories"
        description={`${data?.data?.length ?? 0} catégories`}
        actions={
          <Can perm="categories.create">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditTarget('new')}>
              Nouvelle catégorie
            </Button>
          </Can>
        }
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle="Aucune catégorie"
      />

      {editTarget !== null && (
        <CategorieForm
          categorie={editTarget === 'new' ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(d) => saveMutation.mutate(editTarget === 'new' ? d : { ...d, id: (editTarget as Categorie).id })}
          loading={saveMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer la catégorie"
        description="Cette catégorie sera supprimée définitivement."
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </div>
  )
}

function CategorieForm({ categorie, onClose, onSubmit, loading }: {
  categorie: Categorie | null; onClose: () => void; onSubmit: (d: FormData) => void; loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: categorie ? { nom: categorie.nom, description: categorie.description ?? '' } : undefined,
  })
  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={categorie ? 'Modifier' : 'Nouvelle catégorie'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Nom" required error={errors.nom?.message}>
          <Input {...register('nom')} error={!!errors.nom} />
        </FormField>
        <FormField label="Description">
          <Textarea {...register('description')} rows={2} />
        </FormField>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={loading}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
