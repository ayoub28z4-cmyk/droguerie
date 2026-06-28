import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card } from './Card'

interface StatCardProps {
  label: string
  hint?: string
  value: number
  formatter?: (n: number) => string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'accent' | 'default'
  loading?: boolean
  onClick?: () => void
}

function useCountUp(target: number, duration = 1000) {
  const [current, setCurrent] = useState(target)
  const prevTarget = useRef(target)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (target === prevTarget.current && current === target) return
    const from = prevTarget.current
    prevTarget.current = target
    let rafId: number
    const start = performance.now()
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(from + (target - from) * ease))
      if (progress < 1) {
        rafId = requestAnimationFrame(frame)
      } else {
        setCurrent(target)
      }
    }
    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return { current, ref }
}

const colorConfig = {
  brand:   { icon: 'bg-brand-100 text-brand-600',   border: 'border-brand-200' },
  success: { icon: 'bg-success-bg text-emerald-600', border: 'border-emerald-200' },
  warning: { icon: 'bg-warning-bg text-amber-600',   border: 'border-amber-200' },
  danger:  { icon: 'bg-danger-bg text-red-600',      border: 'border-red-200' },
  accent:  { icon: 'bg-accent-100 text-accent-600',  border: 'border-cyan-200' },
  default: { icon: 'bg-ink-100 text-ink-600',        border: 'border-ink-200' },
}

export function StatCard({
  label,
  hint,
  value,
  formatter = String,
  trend,
  trendLabel,
  icon,
  color = 'default',
  loading,
  onClick,
}: StatCardProps) {
  const { current, ref } = useCountUp(value)
  const colors = colorConfig[color]

  if (loading) {
    return (
      <div className="bg-surface rounded-[var(--radius)] shadow-[var(--shadow-md)] border border-ink-200/60 p-5 animate-pulse">
        <div className="h-4 w-24 bg-ink-200 rounded mb-3" />
        <div className="h-8 w-32 bg-ink-200 rounded" />
      </div>
    )
  }

  return (
    <Card
      hover
      className={cn('p-5', onClick && value > 0 && 'cursor-pointer')}
      onClick={onClick && value > 0 ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-ink-500">{label}</span>
          {hint && <p className="text-[10px] text-ink-400 mt-0.5 leading-tight">{hint}</p>}
        </div>
        {icon && (
          <span className={cn('p-2 rounded-[10px]', colors.icon)}>
            {icon}
          </span>
        )}
      </div>
      <div ref={ref} className="font-display text-2xl font-bold text-ink-900 tabular-nums tracking-tight">
        {formatter(current)}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend > 0 ? (
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              +{Math.abs(trend).toFixed(1)}%
            </span>
          ) : trend < 0 ? (
            <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
              <TrendingDown className="h-3.5 w-3.5" />
              {trend.toFixed(1)}%
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs font-medium text-ink-400">
              <Minus className="h-3.5 w-3.5" />
              0%
            </span>
          )}
          {trendLabel && <span className="text-xs text-ink-400">{trendLabel}</span>}
        </div>
      )}
    </Card>
  )
}

// Animated KPI pill variant
export function KpiPill({ label, value, color = 'default' }: Pick<StatCardProps, 'label' | 'value' | 'color'>) {
  const colors = colorConfig[color]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
        colors.icon, colors.border
      )}
    >
      <span className="font-display font-bold tabular-nums">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </motion.div>
  )
}
