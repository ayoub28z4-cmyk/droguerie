import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { clientsApi } from './clientsApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Input } from '@/shared/ui/FormField'
import { Can } from '@/shared/ui/Can'
import type { Client } from '@/shared/types'

export function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { search, page }],
    queryFn: () => clientsApi.list({ search: search || undefined, page, per_page: 20 }).then((r) => r.data),
  })

  const columns: Column<Client>[] = [
    {
      key: 'nom',
      header: 'Client',
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-600 text-xs font-bold">{(c.nom || c.raison_sociale || '?')[0]}</span>
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm">
              {c.raison_sociale ?? `${c.prenom ?? ''} ${c.nom}`.trim()}
            </p>
            <p className="text-xs text-ink-500">{c.email ?? c.telephone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type_client',
      header: 'Type',
      accessor: (c) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          c.type_client === 'entreprise' ? 'bg-brand-100 text-brand-600' :
          c.type_client === 'professionnel' ? 'bg-accent-100 text-accent-600' :
          'bg-ink-100 text-ink-600'
        }`}>
          {c.type_client}
        </span>
      ),
    },
    {
      key: 'credit_disponible',
      header: 'Crédit dispo.',
      accessor: (c) => <MoneyDisplay amount={c.credit_disponible} size="sm" color={c.credit_disponible > 0 ? 'success' : 'muted'} />,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'solde_du',
      header: 'Solde dû',
      accessor: (c) => <MoneyDisplay amount={c.solde_du} size="sm" color={c.solde_du > 0 ? 'danger' : 'muted'} />,
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      key: 'actif',
      header: 'Statut',
      accessor: (c) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.actif ? 'bg-success-bg text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>
          {c.actif ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${data?.meta?.total ?? 0} clients`}
        actions={
          <Can perm="clients.create">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/clients/nouveau')}>
              Nouveau client
            </Button>
          </Can>
        }
      />
      <div className="mb-5">
        <Input
          placeholder="Rechercher un client..."
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
        keyExtractor={(c) => c.id}
        onRowClick={(c) => navigate(`/clients/${c.id}`)}
        emptyTitle="Aucun client"
        emptyIcon={<Users className="h-6 w-6" />}
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={20}
        onPageChange={setPage}
      />
    </div>
  )
}
