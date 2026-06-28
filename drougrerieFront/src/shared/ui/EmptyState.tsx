import { PackageSearch } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'Aucun résultat',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-8 px-4', className)}>
      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-400">
        {icon ?? <PackageSearch className="h-6 w-6" />}
      </div>
      <div className="text-center">
        <p className="font-semibold text-ink-700">{title}</p>
        {description && <p className="text-sm text-ink-500 mt-0.5">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
