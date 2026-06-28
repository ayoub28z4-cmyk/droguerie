import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, CreditCard, ShoppingCart } from 'lucide-react'
import { clientsApi } from './clientsApi'
import { commandesApi } from '@/features/commandes/commandesApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card, CardTitle } from '@/shared/ui/Card'
import { FormField, Input, SelectNative } from '@/shared/ui/FormField'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { CommandeStatusBadge } from '@/shared/ui/Badge'
import { ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import { formatDateTime } from '@/shared/lib/formatters'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().optional(),
  raison_sociale: z.string().optional(),
  type_client: z.enum(['particulier', 'professionnel', 'entreprise']),
  telephone: z.string().min(1, 'Téléphone requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  ice: z.string().optional(),
  credit_limite: z.coerce.number().nonnegative(),
  actif: z.boolean(),
})
type FormData = z.infer<typeof schema>

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'nouveau'
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', Number(id)],
    queryFn: () => clientsApi.get(Number(id)).then((r) => r.data.data),
    enabled: !isNew && !!id,
  })

  const { data: commandesData } = useQuery({
    queryKey: ['commandes', { client_id: Number(id) }],
    queryFn: () => commandesApi.list({ client_id: Number(id), per_page: 5 }).then((r) => r.data),
    enabled: !isNew && !!id,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    values: client ? {
      nom: client.nom,
      prenom: client.prenom ?? '',
      raison_sociale: client.raison_sociale ?? '',
      type_client: client.type_client,
      telephone: client.telephone,
      email: client.email ?? '',
      adresse: client.adresse ?? '',
      ville: client.ville ?? '',
      ice: client.ice ?? '',
      credit_limite: client.credit_limite,
      actif: client.actif,
    } : { type_client: 'particulier', credit_limite: 0, actif: true, nom: '', telephone: '' },
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      isNew ? clientsApi.create(data) : clientsApi.update(Number(id), data),
    onSuccess: (res) => {
      toast.success(isNew ? 'Client créé' : 'Client mis à jour')
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      if (isNew) navigate(`/clients/${res.data.data.id}`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la sauvegarde')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.delete(Number(id)),
    onSuccess: () => {
      toast.success('Client supprimé')
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate('/clients')
    },
  })

  if (!isNew && isLoading) return <div className="animate-pulse h-64 bg-ink-200 rounded-[var(--radius)]" />

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau client' : (client?.raison_sociale ?? `${client?.prenom ?? ''} ${client?.nom ?? ''}`.trim())}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/clients')}>Retour</Button>
            {!isNew && (
              <Can perm="clients.delete">
                <Button variant="danger-ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>Supprimer</Button>
              </Can>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">Informations client</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Type de client" required>
                  <SelectNative {...register('type_client')}>
                    <option value="particulier">Particulier</option>
                    <option value="professionnel">Professionnel</option>
                    <option value="entreprise">Entreprise</option>
                  </SelectNative>
                </FormField>
                <FormField label="Statut">
                  <SelectNative {...register('actif', { setValueAs: (v) => v === 'true' || v === true })}>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </SelectNative>
                </FormField>
                <FormField label="Raison sociale" error={errors.raison_sociale?.message}>
                  <Input {...register('raison_sociale')} />
                </FormField>
                <FormField label="ICE">
                  <Input {...register('ice')} placeholder="ICE entreprise..." />
                </FormField>
                <FormField label="Nom" required error={errors.nom?.message}>
                  <Input {...register('nom')} error={!!errors.nom} />
                </FormField>
                <FormField label="Prénom">
                  <Input {...register('prenom')} />
                </FormField>
                <FormField label="Téléphone" required error={errors.telephone?.message}>
                  <Input {...register('telephone')} error={!!errors.telephone} />
                </FormField>
                <FormField label="Email">
                  <Input type="email" {...register('email')} />
                </FormField>
                <FormField label="Adresse">
                  <Input {...register('adresse')} />
                </FormField>
                <FormField label="Ville">
                  <Input {...register('ville')} />
                </FormField>
                <FormField label="Limite de crédit (MAD)">
                  <Input type="number" step="0.01" {...register('credit_limite')} />
                </FormField>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" loading={saveMutation.isPending} leftIcon={<Save className="h-4 w-4" />}>
                  {isNew ? 'Créer' : 'Enregistrer'}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {!isNew && client && (
          <div className="space-y-4">
            {/* Credit info */}
            {(client.type_client === 'professionnel' || client.type_client === 'entreprise') && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-brand-600" />
                  <CardTitle>Crédit</CardTitle>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Limite</span>
                    <MoneyDisplay amount={client.credit_limite} size="sm" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Solde dû</span>
                    <MoneyDisplay amount={client.solde_du} size="sm" color={client.solde_du > 0 ? 'danger' : 'muted'} />
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t border-ink-100">
                    <span className="text-ink-700">Disponible</span>
                    <MoneyDisplay amount={client.credit_disponible} size="md" color={client.credit_disponible > 0 ? 'success' : 'danger'} />
                  </div>
                </div>
              </Card>
            )}

            {/* Recent orders */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-ink-500" />
                  <CardTitle>Dernières commandes</CardTitle>
                </div>
                <Button variant="ghost" size="xs" onClick={() => navigate(`/commandes?client_id=${id}`)}>Voir tout</Button>
              </div>
              {(commandesData?.data ?? []).length === 0 ? (
                <p className="text-sm text-ink-400">Aucune commande</p>
              ) : (
                <div className="space-y-2">
                  {commandesData?.data.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-ink-50 rounded-[8px] p-1.5 -mx-1.5 transition-colors"
                      onClick={() => navigate(`/commandes/${c.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-semibold text-ink-700">{c.numero}</p>
                        <p className="text-xs text-ink-400">{formatDateTime(c.created_at)}</p>
                      </div>
                      <CommandeStatusBadge statut={c.statut} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le client"
        description="Êtes-vous sûr de vouloir supprimer ce client ?"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
