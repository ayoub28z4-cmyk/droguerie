import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Search, User, Phone, Mail, MapPin, Building2 } from 'lucide-react'
import { clientsApi } from './clientsApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/FormField'
import { Modal } from '@/shared/ui/Modal'
import { EmptyState } from '@/shared/ui/EmptyState'
import type { Client } from '@/shared/types'

type Statut = 'en_attente' | 'valide' | 'rejete'

const STATUTS: { value: Statut; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'en_attente', label: 'En attente', icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'valide',     label: 'Validés',    icon: <CheckCircle className="h-4 w-4" />, color: 'text-success bg-success/10 border-success/20' },
  { value: 'rejete',     label: 'Rejetés',    icon: <XCircle className="h-4 w-4" />, color: 'text-danger bg-danger-bg border-red-200' },
]

export function InscriptionsPage() {
  const qc = useQueryClient()
  const [statut, setStatut] = useState<Statut>('en_attente')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rejetModal, setRejetModal] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null })
  const [motifRejet, setMotifRejet] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inscriptions', { statut, search, page }],
    queryFn: () => clientsApi.inscriptions({ statut, search: search || undefined, page, per_page: 15 }).then(r => r.data),
  })

  const validerMutation = useMutation({
    mutationFn: (id: number) => clientsApi.validerInscription(id),
    onSuccess: (res) => {
      toast.success(res.data.message)
      qc.invalidateQueries({ queryKey: ['inscriptions'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: () => toast.error('Erreur lors de la validation.'),
  })

  const rejeterMutation = useMutation({
    mutationFn: ({ id, motif }: { id: number; motif?: string }) =>
      clientsApi.rejeterInscription(id, motif),
    onSuccess: (res) => {
      toast.success(res.data.message)
      setRejetModal({ open: false, client: null })
      setMotifRejet('')
      qc.invalidateQueries({ queryKey: ['inscriptions'] })
    },
    onError: () => toast.error('Erreur lors du rejet.'),
  })

  const handleRejeter = () => {
    if (!rejetModal.client) return
    rejeterMutation.mutate({ id: rejetModal.client.id, motif: motifRejet || undefined })
  }

  const statutCfg = STATUTS.find(s => s.value === statut)!

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Inscriptions clients"
        description="Gérez les demandes d'accès au portail client"
        icon={<User className="h-5 w-5 text-brand-600" />}
      />

      {/* Tabs statut */}
      <div className="flex gap-2">
        {STATUTS.map(s => (
          <button
            key={s.value}
            onClick={() => { setStatut(s.value); setPage(1) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statut === s.value
                ? s.color
                : 'text-ink-500 bg-surface border-ink-200 hover:bg-ink-50'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={<Clock className="h-8 w-8 text-ink-300" />}
          title={`Aucune inscription ${statutCfg.label.toLowerCase()}`}
          description="Les demandes apparaîtront ici dès réception."
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((client) => (
            <div
              key={client.id}
              className="bg-surface border border-ink-200/60 rounded-[var(--radius-lg)] p-4 flex items-start justify-between gap-4"
            >
              {/* Info client */}
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-sm">{client.nom[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink-900">
                      {client.prenom ? `${client.prenom} ${client.nom}` : client.nom}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      client.type_client === 'entreprise' ? 'bg-brand-50 text-brand-600 border-brand-200' :
                      client.type_client === 'professionnel' ? 'bg-accent-50 text-accent-600 border-accent-200' :
                      'bg-ink-100 text-ink-600 border-ink-200'
                    }`}>
                      {client.type_client_label ?? client.type_client}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    {client.telephone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {client.telephone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {client.email}
                      </span>
                    )}
                    {client.ville && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {client.ville}
                      </span>
                    )}
                    {client.ice && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> ICE: {client.ice}
                      </span>
                    )}
                  </div>

                  {client.motif_rejet && (
                    <p className="mt-2 text-xs text-danger bg-danger-bg border border-red-200 rounded-[var(--radius)] px-2 py-1">
                      Motif rejet : {client.motif_rejet}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-ink-400">
                    Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {statut === 'en_attente' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRejetModal({ open: true, client }); setMotifRejet('') }}
                    className="text-danger border-red-200 hover:bg-danger-bg"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    loading={validerMutation.isPending && validerMutation.variables === client.id}
                    onClick={() => validerMutation.mutate(client.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-ink-500">
                Page {data.meta.current_page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.meta.last_page}
                onClick={() => setPage(p => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal rejet */}
      <Modal
        open={rejetModal.open}
        onOpenChange={(o) => setRejetModal(v => ({ ...v, open: o }))}
        title="Rejeter l'inscription"
        description={`Vous allez rejeter la demande de ${rejetModal.client?.prenom ?? ''} ${rejetModal.client?.nom ?? ''}.`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Motif du rejet <span className="text-ink-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              placeholder="Indiquez la raison du rejet si nécessaire..."
              rows={3}
              className="w-full rounded-[var(--radius)] border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejetModal({ open: false, client: null })}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger/90 text-white"
              loading={rejeterMutation.isPending}
              onClick={handleRejeter}
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
