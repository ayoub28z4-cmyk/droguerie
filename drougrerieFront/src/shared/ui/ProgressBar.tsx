import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  color?: 'brand' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorClasses = {
  brand:   'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent,
  color = 'brand',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-ink-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-semibold text-ink-700">{percent.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-ink-100 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full', colorClasses[color])}
        />
      </div>
    </div>
  )
}
