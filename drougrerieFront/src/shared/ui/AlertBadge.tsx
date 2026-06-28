import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface AlertBadgeProps {
  count: number
  pulse?: boolean
}

export function AlertBadge({ count, pulse = true }: AlertBadgeProps) {
  if (count === 0) return null

  return (
    <motion.span
      className="relative inline-flex"
      animate={pulse ? { scale: [1, 1.15, 1] } : undefined}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="flex items-center gap-1 bg-danger text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] justify-center">
        {count > 99 ? '99+' : count}
      </span>
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full bg-danger"
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.span>
  )
}

export function StockAlertBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-danger bg-danger-bg border border-red-200 rounded-full px-2 py-1">
      <AlertTriangle className="h-3.5 w-3.5" />
      {count} rupture{count > 1 ? 's' : ''}
    </span>
  )
}
