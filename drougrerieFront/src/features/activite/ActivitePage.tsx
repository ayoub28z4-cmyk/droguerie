import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { Activity, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/FormField'
import type { AuditLog, Personnel, PaginatedResponse } from '@/shared/types'

// ── Config ────────────────────────────────────────────────────────────────────

const COMMANDE_ACTIONS = new Set([
  'commande_creee', 'commande_confirmee', 'commande_en_preparation',
  'commande_en_livraison', 'commande_livree', 'commande_cloturee', 'commande_annulee',
])

const ACTION_META: Record<string, { label: string; color: string }> = {
  connexion:               { label: 'Connexion',        color: 'bg-sky-100 text-sky-700' },
  produit_cree:            { label: 'Produit créé',     color: 'bg-emerald-100 text-emerald-700' },
  produit_modifie:         { label: 'Produit modifié',  color: 'bg-amber-100 text-amber-700' },
  produit_supprime:        { label: 'Produit supprimé', color: 'bg-red-100 text-red-700' },
  commande_creee:          { label: 'Créée',            color: 'bg-emerald-100 text-emerald-700' },
  commande_confirmee:      { label: 'Confirmée',        color: 'bg-sky-100 text-sky-700' },
  commande_en_preparation: { label: 'En préparation',   color: 'bg-amber-100 text-amber-700' },
  commande_en_livraison:   { label: 'En livraison',     color: 'bg-purple-100 text-purple-700' },
  commande_livree:         { label: 'Livrée',           color: 'bg-emerald-100 text-emerald-700' },
  commande_cloturee:       { label: 'Clôturée',         color: 'bg-ink-100 text-ink-600' },
  commande_annulee:        { label: 'Annulée',          color: 'bg-red-100 text-red-700' },
  stock_ajuste:            { label: 'Stock ajusté',     color: 'bg-orange-100 text-orange-700' },
  appro_cree:              { label: 'Appro créé',       color: 'bg-emerald-100 text-emerald-700' },
  appro_statut:            { label: 'Appro statut',     color: 'bg-amber-100 text-amber-700' },
}

// ── Types ─────────────────────────────────────────────────────────────────────

type RegularRow = { kind: 'row'; log: AuditLog; date: string }
type CommandeGroup = { kind: 'commande'; commandeId: number; numero: string; logs: AuditLog[]; date: string }
type DisplayItem = RegularRow | CommandeGroup

// ── Helpers ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action]
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${meta?.color ?? 'bg-ink-100 text-ink-600'}`}>
      {meta?.label ?? action}
    </span>
  )
}

function AgentAvatar({ personnel }: { personnel: AuditLog['personnel'] }) {
  if (!personnel) return <span className="text-xs text-ink-400 italic">Système</span>
  const initials = personnel.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
        <span className="text-white text-[10px] font-bold">{initials}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 leading-none truncate">{personnel.nom}</p>
        <p className="text-[10px] text-ink-400 mt-0.5">{personnel.roles[0] ?? ''}</p>
      </div>
    </div>
  )
}

function timestamp(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm')
}

// ── Row components ────────────────────────────────────────────────────────────

function RegularLogRow({ log }: { log: AuditLog }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-ink-50 transition-colors">
      <span className="text-xs text-ink-400 w-32 shrink-0 tabular-nums">{timestamp(log.created_at)}</span>
      <div className="w-40 shrink-0">
        <AgentAvatar personnel={log.personnel} />
      </div>
      <div className="w-32 shrink-0">
        <ActionBadge action={log.action} />
      </div>
      <span className="text-sm text-ink-700 min-w-0 truncate">{log.description}</span>
    </div>
  )
}

function CommandeGroupRow({
  group,
  expanded,
  onToggle,
}: {
  group: CommandeGroup
  expanded: boolean
  onToggle: () => void
}) {
  const lastAction = group.logs[0]
  const lastActor  = group.logs.find((l) => l.personnel)?.personnel

  return (
    <div className="border border-ink-100 rounded-[10px] overflow-hidden mb-1">
      {/* Header — cliquable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-ink-50 transition-colors text-left"
      >
        <span className="text-xs text-ink-400 w-32 shrink-0 tabular-nums">
          {timestamp(lastAction.created_at)}
        </span>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-ink-400 shrink-0" />
          }
          <span className="font-mono text-sm font-semibold text-ink-900">{group.numero}</span>
          <span className="text-xs text-ink-400">—</span>
          <ActionBadge action={lastAction.action} />
          {lastActor && (
            <span className="text-xs text-ink-500 truncate">par {lastActor.nom}</span>
          )}
        </div>

        <span className="text-xs text-ink-400 shrink-0 bg-ink-100 px-2 py-0.5 rounded-full">
          {group.logs.length} action{group.logs.length > 1 ? 's' : ''}
        </span>
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div className="border-t border-ink-100 bg-ink-50/50 divide-y divide-ink-100">
          {group.logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-6 py-2.5">
              <span className="text-xs text-ink-400 w-32 shrink-0 tabular-nums">{timestamp(log.created_at)}</span>
              <div className="w-36 shrink-0">
                <AgentAvatar personnel={log.personnel} />
              </div>
              <ActionBadge action={log.action} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ActivitePage() {
  const [search, setSearch]           = useState('')
  const [personnelId, setPersonnelId] = useState('')
  const [dateDebut, setDateDebut]     = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [dateFin, setDateFin]         = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [expanded, setExpanded]       = useState<Set<number>>(new Set())

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', search, personnelId, dateDebut, dateFin],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<AuditLog>>('/audit-logs', {
        params: {
          per_page: 300,
          ...(search      && { search }),
          ...(personnelId && { personnel_id: personnelId }),
          ...(dateDebut   && { date_debut: dateDebut }),
          ...(dateFin     && { date_fin: dateFin }),
        },
      }).then((r) => r.data.data),
  })

  const { data: personnelList = [] } = useQuery({
    queryKey: ['personnel', 'all'],
    queryFn: () =>
      personnelApi.get<{ data: Personnel[] }>('/personnel', { params: { per_page: 100 } })
        .then((r) => r.data.data),
  })

  // Grouper les logs : commandes → un groupe par commande_id, reste → ligne individuelle
  const items = useMemo<DisplayItem[]>(() => {
    const commandeGroups = new Map<number, AuditLog[]>()
    const regular: AuditLog[] = []

    for (const log of logs) {
      if (COMMANDE_ACTIONS.has(log.action) && log.model_id) {
        const group = commandeGroups.get(log.model_id) ?? []
        group.push(log)
        commandeGroups.set(log.model_id, group)
      } else {
        regular.push(log)
      }
    }

    const result: DisplayItem[] = [
      ...regular.map((log): RegularRow => ({ kind: 'row', log, date: log.created_at })),
      ...[...commandeGroups.entries()].map(([id, cmdLogs]): CommandeGroup => ({
        kind: 'commande',
        commandeId: id,
        // numero est dans metadata de n'importe quel log du groupe
        numero: cmdLogs.find((l) => l.metadata?.numero)?.metadata?.numero ?? `#${id}`,
        logs: cmdLogs, // déjà triés desc par l'API
        date: cmdLogs[0].created_at,
      })),
    ]

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return result
  }, [logs])

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <PageHeader
        title="Journal d'activité"
        description={`${items.length} événements`}
      />

      {/* Filtres */}
      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <select
            className="h-9 rounded-[var(--radius)] border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={personnelId}
            onChange={(e) => setPersonnelId(e.target.value)}
          >
            <option value="">Tous les agents</option>
            {personnelList.map((p) => (
              <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
            ))}
          </select>

          <div className="flex gap-2 items-center col-span-1 sm:col-span-2 lg:col-span-2">
            <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="text-xs" />
            <span className="text-ink-400 text-xs shrink-0">→</span>
            <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="text-xs" />
          </div>
        </div>
      </Card>

      {/* Liste */}
      <Card padding="none">
        {/* Header tableau */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-ink-100 bg-ink-50">
          <span className="text-xs font-medium text-ink-500 w-32 shrink-0">Date</span>
          <span className="text-xs font-medium text-ink-500 w-40 shrink-0">Agent</span>
          <span className="text-xs font-medium text-ink-500 w-32 shrink-0">Action</span>
          <span className="text-xs font-medium text-ink-500">Description</span>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-ink-100 rounded animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-400">
            <Activity className="h-8 w-8 mb-2" />
            <p className="text-sm">Aucune activité sur cette période</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100 p-2">
            {items.map((item) =>
              item.kind === 'row' ? (
                <RegularLogRow key={item.log.id} log={item.log} />
              ) : (
                <CommandeGroupRow
                  key={`cmd-${item.commandeId}`}
                  group={item}
                  expanded={expanded.has(item.commandeId)}
                  onToggle={() => toggleExpand(item.commandeId)}
                />
              )
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
