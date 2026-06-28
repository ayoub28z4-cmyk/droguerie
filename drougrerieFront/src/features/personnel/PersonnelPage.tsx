import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, UserCog } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { FormField, Input, SelectNative } from '@/shared/ui/FormField'
import { Modal, ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import type { Personnel, PaginatedResponse } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const baseSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  roles: z.array(z.string()),
  actif: z.boolean(),
})

const createSchema = baseSchema
  .extend({
    password: z.string().min(8, 'Minimum 8 caractères'),
    password_confirmation: z.string().min(1, 'Confirmation requise'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  })

const updateSchema = baseSchema
  .refine(
    (d) => !d.password || d.password.length >= 8,
    { message: 'Minimum 8 caractères', path: ['password'] }
  )
  .refine(
    (d) => !d.password || d.password === d.password_confirmation,
    { message: 'Les mots de passe ne correspondent pas', path: ['password_confirmation'] }
  )

type FormData = z.infer<typeof baseSchema>

export function PersonnelPage() {
  const queryClient = useQueryClient()
  const [editTarget, setEditTarget] = useState<Personnel | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['personnel', page],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Personnel>>('/personnel', { params: { page, per_page: 20 } })
        .then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, password, ...rest }: FormData & { id?: number }) => {
      const payload = {
        ...rest,
        ...(password ? { password, password_confirmation: rest.password_confirmation } : {}),
      }
      if (id) return personnelApi.put(`/personnel/${id}`, payload)
      return personnelApi.post('/personnel', payload)
    },
    onSuccess: () => {
      toast.success(editTarget === 'new' ? 'Agent créé' : 'Agent mis à jour')
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
      setEditTarget(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => personnelApi.delete(`/personnel/${id}`),
    onSuccess: () => {
      toast.success('Agent supprimé')
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
      setDeleteTarget(null)
    },
  })

  const columns: Column<Personnel>[] = [
    {
      key: 'nom',
      header: 'Agent',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{p.prenom[0]}{p.nom[0]}</span>
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm">{p.prenom} {p.nom}</p>
            <p className="text-xs text-ink-500">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Rôles',
      accessor: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.roles.map((r) => (
            <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-600 font-medium">{r}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'actif',
      header: 'Statut',
      accessor: (p) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.actif ? 'bg-success-bg text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>
          {p.actif ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      accessor: (p) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditTarget(p) }}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id) }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: 'w-20',
    },
  ]

  return (
    <Can perm="personnel.view">
      <div>
        <PageHeader
          title="Personnel"
          description="Gestion des agents"
          actions={
            <Can perm="personnel.create">
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditTarget('new')}>Nouvel agent</Button>
            </Can>
          }
        />
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          keyExtractor={(p) => p.id}
          emptyTitle="Aucun agent"
          emptyIcon={<UserCog className="h-6 w-6" />}
          page={page}
          totalPages={data?.meta?.last_page}
          totalCount={data?.meta?.total}
          perPage={20}
          onPageChange={setPage}
        />

        {editTarget !== null && (
          <PersonnelForm
            agent={editTarget === 'new' ? null : editTarget}
            onClose={() => setEditTarget(null)}
            onSubmit={(d) => saveMutation.mutate(editTarget === 'new' ? d : { ...d, id: (editTarget as Personnel).id })}
            loading={saveMutation.isPending}
          />
        )}

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Supprimer l'agent"
          description="Êtes-vous sûr ?"
          variant="danger"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        />
      </div>
    </Can>
  )
}

function PersonnelForm({ agent, onClose, onSubmit, loading }: {
  agent: Personnel | null; onClose: () => void; onSubmit: (d: FormData) => void; loading: boolean
}) {
  const isNew = agent === null
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isNew ? createSchema : updateSchema),
    defaultValues: agent ? {
      nom: agent.nom, prenom: agent.prenom, email: agent.email,
      telephone: agent.telephone ?? '',
      roles: agent.roles, actif: agent.actif, password: '', password_confirmation: '',
    } : { roles: ['vendeur'], actif: true, password: '', password_confirmation: '' },
  })

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={agent ? "Modifier l'agent" : 'Nouvel agent'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Prénom" required error={errors.prenom?.message}>
            <Input {...register('prenom')} error={!!errors.prenom} />
          </FormField>
          <FormField label="Nom" required error={errors.nom?.message}>
            <Input {...register('nom')} error={!!errors.nom} />
          </FormField>
          <FormField label="Email" required error={errors.email?.message} className="col-span-2">
            <Input type="email" {...register('email')} error={!!errors.email} />
          </FormField>
          <FormField label="Téléphone">
            <Input {...register('telephone')} />
          </FormField>
          <FormField label="Rôle principal">
            <SelectNative {...register('roles.0')}>
              <option value="admin">Admin</option>
              <option value="vendeur">Vendeur</option>
              <option value="magasinier">Magasinier</option>
            </SelectNative>
          </FormField>
          <FormField
            label="Mot de passe"
            required={isNew}
            hint={!isNew ? 'Laisser vide pour ne pas changer' : ''}
            error={errors.password?.message}
          >
            <Input type="password" {...register('password')} error={!!errors.password} />
          </FormField>
          <FormField
            label="Confirmation du mot de passe"
            required={isNew}
            error={errors.password_confirmation?.message}
          >
            <Input type="password" {...register('password_confirmation')} error={!!errors.password_confirmation} />
          </FormField>
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
