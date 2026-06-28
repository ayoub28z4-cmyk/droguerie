import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { commandesApi } from './commandesApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { CommandeStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Input } from '@/shared/ui/FormField'
import { Can } from '@/shared/ui/Can'
import { formatDateTime } from '@/shared/lib/formatters'
import type { Commande, CommandeStatut, CommandeCanal } from '@/shared/types'

type StatutFilter = CommandeStatut | '' | 'en_cours'

const STATUTS: { value: StatutFilter; label: string }[] = [
  { value: '',          label: 'Tous les statuts' },
  { value: 'en_cours',  label: '🟡 En cours' },
  { value: 'en_attente',    label: 'En attente' },
  { value: 'confirmee',     label: 'Confirmée' },
  { value: 'en_preparation',label: 'En préparation' },
  { value: 'en_livraison',  label: 'En livraison' },
  { value: 'livree',        label: 'Livrée' },
  { value: 'cloturee',      label: 'Clôturée' },
  { value: 'annulee',       label: 'Annulée' },
]

export function CommandesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState<StatutFilter>(
    location.state?.filterEnCours ? 'en_cours' : ''
  )
  const [canal, setCanal] = useState<CommandeCanal | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['commandes', { search, statut, canal, page }],
    queryFn: () =>
      commandesApi.list({
        search: search || undefined,
        statut: statut || undefined,
        canal: canal || undefined,
        page,
        per_page: 15,
      }).then((r) => r.data),
  })

  const columns: Column<Commande>[] = [
    {
      key: 'numero',
      header: 'N° Commande',
      accessor: (c) => (
        <span className="font-mono text-xs font-semibold text-ink-900">{c.numero}</span>
      ),
      width: 'w-32',
    },
    {
      key: 'client',
      header: 'Client',
      accessor: (c) => (
        <div>
          <p className="font-medium text-ink-900 text-sm">
            {c.client?.raison_sociale ?? `${c.client?.prenom ?? ''} ${c.client?.nom ?? ''}`.trim()}
          </p>
          {c.client?.telephone && (
            <p className="text-xs text-ink-500">{c.client.telephone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (c) => <CommandeStatusBadge statut={c.statut} />,
      width: 'w-36',
    },
    {
      key: 'canal',
      header: 'Canal',
      accessor: (c) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          c.canal === 'portail' ? 'bg-accent-100 text-accent-600' : 'bg-ink-100 text-ink-600'
        }`}>
          {c.canal === 'portail' ? 'Portail' : 'Magasin'}
        </span>
      ),
      width: 'w-24',
    },
    {
      key: 'montant_ttc',
      header: 'Montant TTC',
      accessor: (c) => <MoneyDisplay amount={c.montant_ttc} size="sm" />,
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: true,
    },
    {
      key: 'reste_a_payer',
      header: 'Reste à payer',
      accessor: (c) => (
        <MoneyDisplay
          amount={c.reste_a_payer}
          size="sm"
          color={c.reste_a_payer > 0 ? 'danger' : 'success'}
        />
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (c) => (
        <span className="text-xs text-ink-500">{formatDateTime(c.created_at)}</span>
      ),
      width: 'w-36',
      sortable: true,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Commandes"
        description={`${data?.meta?.total ?? 0} commandes au total`}
        actions={
          <Can perm="commandes.create">
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/commandes/nouvelle')}
            >
              Nouvelle commande
            </Button>
          </Can>
        }
      />

      {/*s */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Rechercher un client, numéro..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          value={statut}
          onChange={(e) => { setStatut(e.target.value as StatutFilter); setPage(1) }}
          className="h-9 px-3 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={canal}
          onChange={(e) => { setCanal(e.target.value as CommandeCanal | ''); setPage(1) }}
          className="h-9 px-3 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Tous les canaux</option>
          <option value="magasin">Magasin</option>
          <option value="portail">Portail</option>
        </select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => navigate(`/commandes/${c.id}`)}
        emptyTitle="Aucune commande"
        emptyDescription="Les commandes apparaîtront ici une fois créées."
        emptyAction={
          <Can perm="commandes.create">
            <Button size="sm" onClick={() => navigate('/commandes/nouvelle')}>
              Créer une commande
            </Button>
          </Can>
        }
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={15}
        onPageChange={setPage}
      />
    </div>
  )
}
