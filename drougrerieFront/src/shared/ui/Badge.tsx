import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import type { CommandeStatut, PaiementStatut, ApproStatut } from '@/shared/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium border',
  {
    variants: {
      variant: {
        default:  'bg-ink-100   text-ink-700  border-ink-200',
        brand:    'bg-brand-100 text-brand-600 border-brand-200',
        success:  'bg-success-bg text-emerald-700 border-emerald-200',
        warning:  'bg-warning-bg text-amber-700  border-amber-200',
        danger:   'bg-danger-bg  text-red-700   border-red-200',
        accent:   'bg-accent-100 text-accent-600 border-cyan-200',
        ink:      'bg-ink-900   text-white      border-ink-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-ink-500':      variant === 'default',
            'bg-brand-500':    variant === 'brand',
            'bg-success':      variant === 'success',
            'bg-warning':      variant === 'warning',
            'bg-danger':       variant === 'danger',
            'bg-accent-500':   variant === 'accent',
            'bg-white':        variant === 'ink',
          })}
        />
      )}
      {children}
    </span>
  )
}

// ── Status pills ──────────────────────────────────────────

const commandeStatutConfig: Record<CommandeStatut, { label: string; variant: BadgeProps['variant'] }> = {
  en_attente:    { label: 'En attente',    variant: 'default' },
  confirmee:     { label: 'Confirmée',     variant: 'accent' },
  en_preparation:{ label: 'En préparation',variant: 'warning' },
  en_livraison:  { label: 'En livraison',  variant: 'brand' },
  livree:        { label: 'Livrée',        variant: 'success' },
  cloturee:      { label: 'Clôturée',      variant: 'ink' },
  annulee:       { label: 'Annulée',       variant: 'danger' },
}

export function CommandeStatusBadge({ statut }: { statut: CommandeStatut }) {
  const config = commandeStatutConfig[statut]
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

const paiementStatutConfig: Record<PaiementStatut, { label: string; variant: BadgeProps['variant'] }> = {
  en_attente: { label: 'En attente', variant: 'warning' },
  valide:     { label: 'Validé',     variant: 'success' },
  rejete:     { label: 'Rejeté',     variant: 'danger' },
  rembourse:  { label: 'Remboursé',  variant: 'default' },
}

export function PaiementStatusBadge({ statut }: { statut: PaiementStatut }) {
  const config = paiementStatutConfig[statut]
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

const approStatutConfig: Record<ApproStatut, { label: string; variant: BadgeProps['variant'] }> = {
  brouillon:   { label: 'Brouillon',   variant: 'default' },
  commande:    { label: 'Commandé',    variant: 'accent' },
  en_transit:  { label: 'En transit',  variant: 'warning' },
  receptionne: { label: 'Réceptionné', variant: 'brand' },
  valide:      { label: 'Validé',      variant: 'success' },
}

export function ApproStatusBadge({ statut }: { statut: ApproStatut }) {
  const config = approStatutConfig[statut]
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

export function StockStatusBadge({ statut }: { statut: 'actif' | 'rupture' | 'archive' }) {
  const map = {
    actif:   { label: 'Actif',   variant: 'success' as const },
    rupture: { label: 'Rupture', variant: 'danger' as const },
    archive: { label: 'Archivé', variant: 'default' as const },
  }
  const c = map[statut]
  return <Badge variant={c.variant} dot>{c.label}</Badge>
}
