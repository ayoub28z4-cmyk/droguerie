import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, ArrowUpDown, Search, X, Package, History, AlertTriangle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { FormField, Input, SelectNative, Textarea } from '@/shared/ui/FormField'
import { Modal } from '@/shared/ui/Modal'
import { Badge } from '@/shared/ui/Badge'
import { Can } from '@/shared/ui/Can'
import { cn } from '@/shared/lib/utils'
import { formatDateTime, formatNumber } from '@/shared/lib/formatters'
import type { MouvementStock, Produit, PaginatedResponse, MouvementType } from '@/shared/types'

const ajustSchema = z.object({
  produit_id: z.coerce.number().positive('Produit requis'),
  type_mouvement: z.enum(['entree', 'sortie', 'ajustement', 'retour']),
  quantite: z.coerce.number(),
  motif: z.string().min(1, 'Motif requis'),
})
type AjustForm = z.infer<typeof ajustSchema>

const TYPE_FILTERS: { value: MouvementType | 'tous'; label: string }[] = [
  { value: 'tous',        label: 'Tous' },
  { value: 'entree',      label: 'Entrée' },
  { value: 'sortie',      label: 'Sortie' },
  { value: 'retour',      label: 'Retour' },
  { value: 'ajustement',  label: 'Ajustement' },
  { value: 'inventaire',  label: 'Inventaire' },
]

const MOUVEMENT_LABELS: Record<MouvementType, string> = {
  entree: 'Entrée', sortie: 'Sortie', retour: 'Retour',
  ajustement: 'Ajustement', inventaire: 'Inventaire',
}

const TYPE_VARIANT: Record<MouvementType, 'success' | 'danger' | 'accent' | 'default'> = {
  entree:      'success',
  sortie:      'danger',
  retour:      'accent',
  ajustement:  'default',
  inventaire:  'default',
}

type Tab = 'inventaire' | 'mouvements'

export function StockPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('inventaire')
  const [alertesOnly, setAlertesOnly] = useState<boolean>(
    location.state?.filterAlertes === true
  )
  const [ajustOpen, setAjustOpen] = useState(false)
  const [ajustPrefill, setAjustPrefill] = useState<number | null>(null)

  // — Onglet inventaire —
  const [invSearch, setInvSearch] = useState('')
  const [invSearchDebounced, setInvSearchDebounced] = useState('')
  const [invPage, setInvPage] = useState(1)
  const [invStatut, setInvStatut] = useState<'tous' | 'actif' | 'rupture' | 'archive'>('tous')

  useEffect(() => {
    const t = setTimeout(() => { setInvSearchDebounced(invSearch); setInvPage(1) }, 350)
    return () => clearTimeout(t)
  }, [invSearch])

  const { data: produits, isLoading: produitsLoading } = useQuery({
    queryKey: ['produits', 'stock-inventaire', invPage, invSearchDebounced, invStatut, alertesOnly],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Produit>>('/produits', {
        params: {
          page: invPage,
          per_page: 20,
          ...(invSearchDebounced ? { search: invSearchDebounced } : {}),
          ...(!alertesOnly && invStatut !== 'tous' ? { statut: invStatut } : {}),
          ...(alertesOnly ? { alerte_stock: 1 } : {}),
        },
      }).then((r) => r.data),
  })

  // — Onglet mouvements —
  const [movPage, setMovPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<MouvementType | 'tous'>('tous')
  const [movSearch, setMovSearch] = useState('')
  const [movSearchDebounced, setMovSearchDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setMovSearchDebounced(movSearch); setMovPage(1) }, 350)
    return () => clearTimeout(t)
  }, [movSearch])

  const { data: mouvements, isLoading: movLoading } = useQuery({
    queryKey: ['stock', 'mouvements', movPage, typeFilter, movSearchDebounced],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<MouvementStock>>('/stock/mouvements', {
        params: {
          page: movPage,
          per_page: 20,
          ...(typeFilter !== 'tous' ? { type_mouvement: typeFilter } : {}),
          ...(movSearchDebounced ? { search: movSearchDebounced } : {}),
        },
      }).then((r) => r.data),
    enabled: tab === 'mouvements',
  })

// — Produits pour le select ajustement —
  const { data: allProduits } = useQuery({
    queryKey: ['produits', 'autocomplete'],
    queryFn: () =>
      personnelApi.get('/produits', { params: { per_page: 200 } })
        .then((r) => r.data.data),
  })

  const ajustMutation = useMutation({
    mutationFn: (data: AjustForm) => personnelApi.post('/stock/ajuster', data),
    onSuccess: () => {
      toast.success('Ajustement enregistré')
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      setAjustOpen(false)
      setAjustPrefill(null)
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.errors) {
        const messages = Object.values(data.errors as Record<string, string[]>).flat().join(' • ')
        toast.error(messages)
      } else {
        toast.error(data?.message ?? 'Erreur lors de l\'ajustement')
      }
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<AjustForm>({
    resolver: zodResolver(ajustSchema) as any,
    defaultValues: { type_mouvement: 'ajustement', quantite: 1 },
  })

  const openAjust = (produitId?: number) => {
    reset({ type_mouvement: 'ajustement', quantite: 1, produit_id: produitId ?? (0 as any) })
    setAjustPrefill(produitId ?? null)
    setAjustOpen(true)
  }

  // — Colonnes inventaire —
  const invColumns: Column<Produit>[] = [
    {
      key: 'designation',
      header: 'Produit',
      accessor: (p) => (
        <div>
          <p className="text-sm font-medium text-ink-900">{p.designation}</p>
          <p className="text-xs text-ink-400 font-mono">{p.reference}</p>
        </div>
      ),
    },
    {
      key: 'stock_actuel',
      header: 'Stock actuel',
      accessor: (p) => (
        <span className={cn(
          'font-display text-base font-bold tabular-nums',
          p.stock_actuel <= 0 ? 'text-danger' :
          p.stock_actuel <= p.stock_minimum ? 'text-amber-500' : 'text-success'
        )}>
          {formatNumber(p.stock_actuel)}
          <span className="text-xs font-normal text-ink-400 ml-1">{p.unite}</span>
        </span>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'stock_minimum',
      header: 'Seuil min',
      accessor: (p) => <span className="text-xs text-ink-500 tabular-nums">{formatNumber(p.stock_minimum)} {p.unite}</span>,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (p) => (
        <Badge variant={
          p.statut === 'actif' ? 'success' :
          p.statut === 'rupture' ? 'danger' : 'default'
        }>
          {p.statut === 'actif' ? 'Actif' : p.statut === 'rupture' ? 'Rupture' : 'Archivé'}
        </Badge>
      ),
    },
    {
      key: 'ajuster',
      header: '',
      accessor: (p) => (
        <Can perm="stock.ajuster">
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Plus className="h-3 w-3" />}
            onClick={(e) => { e.stopPropagation(); openAjust(p.id) }}
          >
            Ajuster
          </Button>
        </Can>
      ),
      width: 'w-24',
    },
  ]

  // — Colonnes mouvements —
  const movColumns: Column<MouvementStock>[] = [
    {
      key: 'produit',
      header: 'Produit',
      accessor: (m) => (
        <p className="text-sm font-medium text-ink-900">{m.produit?.designation ?? `#${m.produit_id}`}</p>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (m) => (
        <Badge variant={TYPE_VARIANT[m.type_mouvement]}>
          {MOUVEMENT_LABELS[m.type_mouvement]}
        </Badge>
      ),
    },
    {
      key: 'quantite',
      header: 'Quantité',
      accessor: (m) => (
        <span className={`font-semibold tabular-nums text-sm ${
          m.type_mouvement === 'entree' || m.type_mouvement === 'retour' ? 'text-success' : 'text-danger'
        }`}>
          {m.type_mouvement === 'entree' || m.type_mouvement === 'retour' ? '+' : '-'}{Math.abs(m.quantite)}
        </span>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'stock',
      header: 'Stock avant → après',
      accessor: (m) => (
        <span className="text-xs text-ink-600 tabular-nums">
          {formatNumber(m.stock_avant)} → <span className="font-semibold text-ink-900">{formatNumber(m.stock_apres)}</span>
        </span>
      ),
    },
    {
      key: 'motif',
      header: 'Motif',
      accessor: (m) => <span className="text-xs text-ink-500 truncate max-w-40 block">{m.motif ?? '—'}</span>,
    },
    {
      key: 'personnel',
      header: 'Par',
      accessor: (m) => m.personnel ? (
        <span className="text-xs text-ink-700 font-medium whitespace-nowrap">
          {m.personnel.prenom ? `${m.personnel.prenom} ${m.personnel.nom}` : m.personnel.nom}
        </span>
      ) : (
        <span className="text-xs text-ink-300">—</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (m) => <span className="text-xs text-ink-400">{formatDateTime(m.created_at)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Inventaire et historique des mouvements"
        actions={
          <Can perm="stock.ajuster">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openAjust()}>
              Ajustement
            </Button>
          </Can>
        }
      />


      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-ink-100 rounded-[12px] w-fit mb-5">
        {([
          { key: 'inventaire', label: 'Stock par produit', icon: <Package className="h-3.5 w-3.5" /> },
          { key: 'mouvements', label: 'Historique mouvements', icon: <History className="h-3.5 w-3.5" /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-[10px] text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-surface text-ink-900 shadow-(--shadow-sm)'
                : 'text-ink-500 hover:text-ink-700'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Onglet : Stock par produit ── */}
      {tab === 'inventaire' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full h-9 pl-9 pr-8 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              {invSearch && (
                <button onClick={() => setInvSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {alertesOnly && (
                <button
                  onClick={() => { setAlertesOnly(false); setInvPage(1) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-danger-bg text-danger border-red-200 shadow-sm"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Alertes uniquement
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              )}
              {!alertesOnly && (['tous', 'actif', 'rupture', 'archive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setInvStatut(s); setInvPage(1) }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    invStatut === s
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-surface text-ink-600 border-ink-200 hover:border-ink-400 hover:text-ink-900'
                  )}
                >
                  {s === 'tous' ? 'Tous' : s === 'actif' ? 'Actif' : s === 'rupture' ? 'Rupture' : 'Archivé'}
                </button>
              ))}
            </div>
          </div>
          <DataTable
            data={produits?.data ?? []}
            columns={invColumns}
            loading={produitsLoading}
            keyExtractor={(p) => p.id}
            emptyTitle="Aucun produit"
            emptyDescription="Aucun résultat pour ces filtres."
            emptyIcon={<Package className="h-6 w-6" />}
            page={invPage}
            totalPages={produits?.meta?.last_page}
            totalCount={produits?.meta?.total}
            perPage={20}
            onPageChange={setInvPage}
          />
        </>
      )}

      {/* ── Onglet : Historique mouvements ── */}
      {tab === 'mouvements' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              <input
                type="text"
                value={movSearch}
                onChange={(e) => setMovSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full h-9 pl-9 pr-8 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              {movSearch && (
                <button onClick={() => setMovSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setTypeFilter(f.value); setMovPage(1) }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    typeFilter === f.value
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-surface text-ink-600 border-ink-200 hover:border-ink-400 hover:text-ink-900'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <DataTable
            data={mouvements?.data ?? []}
            columns={movColumns}
            loading={movLoading}
            keyExtractor={(m) => m.id}
            emptyTitle="Aucun mouvement"
            emptyDescription="Aucun résultat pour ces filtres."
            emptyIcon={<ArrowUpDown className="h-6 w-6" />}
            page={movPage}
            totalPages={mouvements?.meta?.last_page}
            totalCount={mouvements?.meta?.total}
            perPage={20}
            onPageChange={setMovPage}
          />
        </>
      )}

      {/* Modal ajustement */}
      <Modal open={ajustOpen} onOpenChange={(o) => { if (!o) { setAjustOpen(false); setAjustPrefill(null) } }} title="Ajustement de stock" size="sm">
        <form onSubmit={handleSubmit((d) => ajustMutation.mutate(d))} className="space-y-4">
          <FormField label="Produit" required error={errors.produit_id?.message}>
            <SelectNative {...register('produit_id')} error={!!errors.produit_id}>
              <option value="">Sélectionner un produit...</option>
              {(allProduits as Produit[] ?? []).map((p) => (
                <option key={p.id} value={p.id} selected={p.id === ajustPrefill}>
                  {p.designation} — stock : {p.stock_actuel} {p.unite}
                </option>
              ))}
            </SelectNative>
          </FormField>
          <FormField label="Type de mouvement">
            <SelectNative {...register('type_mouvement')}>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
              <option value="ajustement">Ajustement</option>
              <option value="retour">Retour</option>
            </SelectNative>
          </FormField>
          <FormField
            label="Quantité"
            required
            error={errors.quantite?.message}
            hint={watch('type_mouvement') === 'ajustement' ? 'Positif = ajout, négatif = retrait' : undefined}
          >
            <Input type="number" step="0.001" {...register('quantite')} error={!!errors.quantite} />
          </FormField>
          <FormField label="Motif" required error={errors.motif?.message}>
            <Textarea placeholder="Raison de l'ajustement..." {...register('motif')} error={!!errors.motif} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => { setAjustOpen(false); setAjustPrefill(null) }}>Annuler</Button>
            <Button type="submit" loading={ajustMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
