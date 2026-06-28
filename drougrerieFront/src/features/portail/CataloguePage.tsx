import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ShoppingCart } from 'lucide-react'
import { clientApi } from '@/shared/api/clientApi'
import { Input } from '@/shared/ui/FormField'
import { Badge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import type { Produit, Categorie, PaginatedResponse } from '@/shared/types'

export function CataloguePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categorieId, setCategorieId] = useState<number | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['portail', 'categories'],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Categorie>>('/categories', { params: { per_page: 100 } })
        .then((r) => r.data.data.filter((c) => (c.produits_count ?? 0) > 0)),
    staleTime: 5 * 60 * 1000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['portail', 'catalogue', search, categorieId, page],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Produit>>('/produits', {
        params: {
          search: search || undefined,
          categorie_id: categorieId ?? undefined,
          page,
          per_page: 24,
          statut: 'actif',
        },
      }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Notre catalogue</h1>
        <p className="text-ink-500">Découvrez notre sélection de matériaux BTP</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher ciment, carrelage, peinture..."
          leftIcon={<Search className="h-4.5 w-4.5" />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-md h-11 text-base rounded-[12px]"
        />
      </div>

      {/* Category pills */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setCategorieId(null); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categorieId === null
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategorieId(c.id); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categorieId === c.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius)] bg-surface border border-ink-200 animate-pulse overflow-hidden">
              <div className="aspect-square bg-ink-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-ink-200 rounded w-3/4" />
                <div className="h-3 bg-ink-100 rounded w-1/2" />
                <div className="h-5 bg-ink-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <EmptyState
          title="Aucun produit trouvé"
          description="Essayez un autre terme de recherche."
          icon={<Package className="h-8 w-8" />}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(data?.data ?? []).map((produit, index) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px -4px rgb(15 23 42 / 0.12)' }}
                className="group rounded-[var(--radius)] bg-surface border border-ink-200/60 overflow-hidden cursor-pointer shadow-[var(--shadow-sm)] transition-all duration-200"
                onClick={() => navigate(`/portail/commandes/nouvelle?produit=${produit.id}`)}
              >
                {/* Image */}
                <div className="aspect-square bg-ink-50 overflow-hidden relative">
                  {produit.images[0] ? (
                    <img
                      src={produit.images[0].medium}
                      alt={produit.designation}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-ink-300" />
                    </div>
                  )}
                  {produit.statut === 'rupture' && (
                    <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                      <Badge variant="danger">Rupture de stock</Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  {produit.categorie && (
                    <p className="text-xs text-ink-400 mb-0.5 uppercase tracking-wide font-medium">
                      {produit.categorie.nom}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-ink-900 line-clamp-2 leading-snug mb-2">
                    {produit.designation}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <MoneyDisplay amount={produit.prix_vente_ttc} size="sm" />
                      <p className="text-xs text-ink-400">/ {produit.unite}</p>
                    </div>
                    {produit.statut !== 'rupture' && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-brand"
                        onClick={(e) => { e.stopPropagation(); navigate(`/portail/commandes/nouvelle?produit=${produit.id}`) }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={page === p ? 'primary' : 'outline'}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
