import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ShoppingCart, TrendingUp, AlertTriangle, Users,
  Package, Clock, CreditCard
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import { dashboardApi } from './dashboardApi'
import { StatCard } from '@/shared/ui/StatCard'
import { Card, CardHeader, CardTitle } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { formatMoney, formatDate } from '@/shared/lib/formatters'
import { Button } from '@/shared/ui/Button'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getTableauDeBord().then((r) => r.data.data),
  })

  const caTrend = data && data.ca_mois_precedent > 0
    ? ((data.ca_mois - data.ca_mois_precedent) / data.ca_mois_precedent) * 100
    : 0

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité"
        actions={
          <Button onClick={() => navigate('/commandes/nouvelle')} leftIcon={<ShoppingCart className="h-4 w-4" />}>
            Nouvelle commande
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="CA du mois"
          hint="Commandes livrées et clôturées"
          value={data?.ca_mois ?? 0}
          formatter={formatMoney}
          trend={caTrend}
          trendLabel="vs mois précédent"
          icon={<TrendingUp className="h-4 w-4" />}
          color="brand"
          loading={isLoading}
        />
        <StatCard
          label="Encaissé du mois"
          hint="Paiements validés sur commandes livrées"
          value={data?.encaisse_mois ?? 0}
          formatter={formatMoney}
          icon={<CreditCard className="h-4 w-4" />}
          color="success"
          loading={isLoading}
        />
        <StatCard
          label="Commandes en cours"
          hint="Cliquer pour voir le détail"
          value={data?.nb_commandes_en_cours ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="accent"
          loading={isLoading}
          onClick={() => navigate('/commandes', { state: { filterEnCours: true } })}
        />
        <StatCard
          label="Alertes stock"
          hint="Cliquer pour voir les produits"
          value={data?.nb_alertes_stock ?? 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          color={data?.nb_alertes_stock ? 'danger' : 'success'}
          loading={isLoading}
          onClick={() => navigate('/stock', { state: { filterAlertes: true } })}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* CA Weekly */}
        <Card className="xl:col-span-2" padding="none">
          <div className="p-5 pb-2">
            <CardTitle>Chiffre d'affaires — 7 derniers jours</CardTitle>
          </div>
          <div className="h-52 px-2 pb-3">
            {isLoading ? (
              <div className="h-full bg-ink-50 animate-pulse rounded-[10px] mx-3" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chiffre_affaires_semaine ?? []}>
                  <defs>
                    <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) => formatDate(d).slice(0, 5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip
                    formatter={(v) => [formatMoney(v as number), 'CA']}
                    labelFormatter={(l) => formatDate(l)}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#caGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#F97316' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Statuts commandes */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardTitle>Statuts commandes</CardTitle>
          </div>
          <div className="h-52 px-2 pb-3">
            {isLoading ? (
              <div className="h-full bg-ink-50 animate-pulse rounded-[10px] mx-3" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.repartition_statuts ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="statut"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(s: string) => s.replace('_', ' ')}
                  />
                  <Tooltip
                    formatter={(v) => [v, 'commandes']}
                    contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle>Top produits du mois</CardTitle>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-ink-200 rounded-[8px]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-ink-200 rounded w-3/4" />
                    <div className="h-3 bg-ink-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (data?.top_produits ?? []).length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-4">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-2">
              {(data?.top_produits ?? []).slice(0, 5).map((item, i) => (
                <motion.div
                  key={item.produit.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-ink-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/produits/${item.produit.id}`)}
                >
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-[8px] bg-ink-100 flex items-center justify-center flex-shrink-0">
                    {item.produit.images[0] ? (
                      <img src={item.produit.images[0].thumbnail} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    ) : (
                      <Package className="h-4 w-4 text-ink-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{item.produit.designation}</p>
                    <p className="text-xs text-ink-500">{item.total_vendu} {item.produit.unite} vendus</p>
                  </div>
                  <span className="text-sm font-semibold text-ink-900 tabular-nums flex-shrink-0">
                    {formatMoney(item.ca)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nouvelle commande', icon: <ShoppingCart className="h-5 w-5" />, to: '/commandes/nouvelle', color: 'bg-brand-100 text-brand-600' },
              { label: 'Ajuster le stock', icon: <Package className="h-5 w-5" />, to: '/stock', color: 'bg-accent-100 text-accent-600' },
              { label: 'Voir les alertes', icon: <AlertTriangle className="h-5 w-5" />, to: '/stock', color: 'bg-danger-bg text-danger' },
              { label: 'Rapports CA', icon: <TrendingUp className="h-5 w-5" />, to: '/rapports', color: 'bg-success-bg text-emerald-600' },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.to)}
                className="flex flex-col items-center gap-2 p-4 rounded-[12px] border border-ink-200/60 hover:border-ink-300 hover:shadow-[var(--shadow-sm)] transition-all text-center group"
              >
                <span className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </span>
                <span className="text-xs font-medium text-ink-700 group-hover:text-ink-900 transition-colors">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
