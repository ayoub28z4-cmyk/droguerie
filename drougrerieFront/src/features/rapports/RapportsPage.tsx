import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card, CardTitle } from '@/shared/ui/Card'
import { StatCard } from '@/shared/ui/StatCard'
import { FormField, Input } from '@/shared/ui/FormField'
import { formatMoney } from '@/shared/lib/formatters'
import { TrendingUp, ShoppingCart, CreditCard, Clock } from 'lucide-react'
import type { RapportCA, TopProduit } from '@/shared/types'
import { format, subDays } from 'date-fns'

export function RapportsPage() {
  const [debut, setDebut] = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [fin, setFin] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { data: ca, isLoading: caLoading } = useQuery({
    queryKey: ['rapports', 'ca', debut, fin],
    queryFn: () =>
      personnelApi.get<{ data: RapportCA }>('/rapports/chiffre-affaires', { params: { date_debut: debut, date_fin: fin } })
        .then((r) => r.data.data),
  })

  const { data: topProduits } = useQuery({
    queryKey: ['rapports', 'top-produits', debut, fin],
    queryFn: () =>
      personnelApi.get<{ data: TopProduit[] }>('/rapports/top-produits', { params: { date_debut: debut, date_fin: fin, limite: 10 } })
        .then((r) => r.data.data),
  })

  const COLORS = ['#F97316', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']

  return (
    <div>
      <PageHeader title="Rapports" description="Analyse de votre activité commerciale" />

      {/* Period filter */}
      <div className="flex gap-4 mb-6 items-end">
        <FormField label="Du">
          <Input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} className="w-40" />
        </FormField>
        <FormField label="Au">
          <Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="w-40" />
        </FormField>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Commandes" value={ca?.nb_commandes ?? 0} icon={<ShoppingCart className="h-4 w-4" />} loading={caLoading} />
        <StatCard label="CA TTC" value={ca?.total_ttc ?? 0} formatter={formatMoney} icon={<TrendingUp className="h-4 w-4" />} color="brand" loading={caLoading} />
        <StatCard label="Encaissé" value={ca?.total_encaisse ?? 0} formatter={formatMoney} icon={<CreditCard className="h-4 w-4" />} color="success" loading={caLoading} />
        <StatCard label="Restant dû" value={ca?.total_restant ?? 0} formatter={formatMoney} icon={<Clock className="h-4 w-4" />} color={ca?.total_restant ? 'danger' : 'default'} loading={caLoading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* CA par période */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardTitle>Évolution du CA</CardTitle>
          </div>
          <div className="h-64 px-2 pb-3">
            {caLoading ? (
              <div className="h-full bg-ink-50 animate-pulse rounded-[10px] mx-3" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ca?.par_periode ?? []}>
                  <defs>
                    <linearGradient id="caGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="periode"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={42}
                  />
                  <Tooltip
                    formatter={(v) => [formatMoney(v as number), 'CA TTC']}
                    contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="total_ttc" stroke="#F97316" strokeWidth={2} fill="url(#caGrad2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top produits */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardTitle>Top produits</CardTitle>
          </div>
          <div className="h-64 px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(topProduits ?? []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis
                  type="category"
                  dataKey="produit.designation"
                  tick={{ fontSize: 9, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  tickFormatter={(s: string) => s.length > 14 ? s.slice(0, 14) + '…' : s}
                />
                <Tooltip
                  formatter={(v) => [formatMoney(v as number), 'CA TTC']}
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="ca_ttc" radius={[0, 4, 4, 0]} barSize={14}>
                  {(topProduits ?? []).slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Table top produits */}
      {topProduits && topProduits.length > 0 && (
        <Card className="mt-5" padding="none">
          <div className="p-4 border-b border-ink-100"><CardTitle>Détail top produits</CardTitle></div>
          <div className="divide-y divide-ink-100">
            {topProduits.filter((item) => item.produit).slice(0, 10).map((item, i) => (
              <div key={item.produit?.id ?? i} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{item.produit?.designation ?? '—'}</p>
                  <p className="text-xs text-ink-500">{item.quantite_vendue} {item.produit?.unite ?? ''} vendus</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ink-900 tabular-nums">{formatMoney(item.ca_ttc)}</p>
                  <p className="text-xs text-ink-400">TTC</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
