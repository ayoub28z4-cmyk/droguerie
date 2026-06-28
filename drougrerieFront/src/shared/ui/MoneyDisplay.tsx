import { cn } from '@/shared/lib/utils'
import { formatMoney } from '@/shared/lib/formatters'

interface MoneyDisplayProps {
  amount: number | null | undefined
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'default' | 'success' | 'danger' | 'muted'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
}

const colorClasses = {
  default: 'text-ink-900',
  success: 'text-success',
  danger:  'text-danger',
  muted:   'text-ink-500',
}

export function MoneyDisplay({ amount, className, size = 'md', color = 'default' }: MoneyDisplayProps) {
  return (
    <span className={cn('font-display tabular-nums', sizeClasses[size], colorClasses[color], className)}>
      {formatMoney(amount)}
    </span>
  )
}
