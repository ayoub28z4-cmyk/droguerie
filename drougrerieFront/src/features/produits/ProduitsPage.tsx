import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Package } from 'lucide-react'
import { produitsApi } from './produitsApi'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { StockStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Input } from '@/shared/ui/FormField'
import { Can } from '@/shared/ui/Can'
import { formatNumber } from '@/shared/lib/formatters'
import type { Produit, Categorie, PaginatedResponse } from '@/shared/types'

export function ProduitsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('')
  const [categorieId, setCategorieId] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Categorie>>('/categories', { params: { per_page: 100 } })
        .then((r) => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['produits', { search, statut, categorieId, page }],
    queryFn: () =>
      produitsApi.list({
        search: search || undefined,
        statut: statut || undefined,
        categorie_id: categorieId ? Number(categorieId) : undefined,
        page,
        per_page: 20,
      }).then((r) => r.data),
  })

  const columns: Column<Produit>[] = [
    {
      key: 'image',
      header: '',
      accessor: (p) => (
        <div className="w-9 h-9 rounded-[8px] bg-ink-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {p.images[0] ? (
            <img src={p.images[0].thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="h-4 w-4 text-ink-400" />
          )}
        </div>
      ),
      width: 'w-12',
    },
    {
      key: 'reference',
      header: 'Référence',
      accessor: (p) => <span className="font-mono text-xs font-semibold text-ink-700">{p.reference}</span>,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'designation',
      header: 'Désignation',
      accessor: (p) => (
        <div>
          <p className="font-medium text-ink-900 text-sm">{p.designation}</p>
          {p.categorie && <p className="text-xs text-ink-500">{p.categorie.nom}</p>}
        </div>
      ),
    },
    {
      key: 'prix_vente_ttc',
      header: 'Prix TTC',
      accessor: (p) => <MoneyDisplay amount={p.prix_vente_ttc} size="sm" />,
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: true,
    },
    {
      key: 'stock_actuel',
      header: 'Stock',
      accessor: (p) => (
        <div className="text-right">
          <span className={`font-semibold tabular-nums text-sm ${
            p.stock_actuel <= 0 ? 'text-danger' :
            p.stock_actuel <= p.stock_minimum ? 'text-warning' : 'text-ink-900'
          }`}>
            {formatNumber(p.stock_actuel)}
          </span>
          <span className="text-xs text-ink-400 ml-1">{p.unite}</span>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: true,
    },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (p) => <StockStatusBadge statut={p.statut} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Produits"
        description={`${data?.meta?.total ?? 0} produits`}
        actions={
          <Can perm="produits.create">
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/produits/nouveau')}
            >
              Nouveau produit
            </Button>
          </Can>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Rechercher un produit..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          value={categorieId}
          onChange={(e) => { setCategorieId(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Toutes les catégories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <select
          value={statut}
          onChange={(e) => { setStatut(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-[10px] border border-ink-300 bg-surface text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="rupture">Rupture</option>
          <option value="archive">Archivé</option>
        </select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => navigate(`/produits/${p.id}`)}
        emptyTitle="Aucun produit"
        emptyDescription="Ajoutez votre premier produit pour commencer."
        page={page}
        totalPages={data?.meta?.last_page}
        totalCount={data?.meta?.total}
        perPage={20}
        onPageChange={setPage}
      />
    </div>
  )
}
