import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  skeletonRows?: number
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  emptyIcon?: React.ReactNode
  // pagination
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  perPage?: number
}

// Skeleton rows use CSS animation instead of framer variants to avoid type conflicts

export function DataTable<T>({
  data,
  columns,
  loading,
  skeletonRows = 6,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDir,
  onSort,
  emptyTitle = 'Aucun résultat',
  emptyDescription,
  emptyAction,
  emptyIcon,
  page,
  totalPages,
  onPageChange,
  totalCount,
  perPage,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-[var(--radius)] border border-ink-200/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50 border-b border-ink-200/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-ink-500 text-xs uppercase tracking-wide',
                    col.sortable && 'cursor-pointer select-none hover:text-ink-700',
                    col.headerClassName,
                    col.width
                  )}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-ink-300">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-brand-500" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-brand-500" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-ink-100 animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      <div className="h-4 bg-ink-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {data.map((row, index) => (
                  <motion.tr
                    key={keyExtractor(row)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={cn(
                      'border-b border-ink-100 last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-ink-50 transition-colors'
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-ink-700', col.className)}>
                        {col.accessor(row)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-ink-500">
            {totalCount !== undefined && perPage !== undefined && page !== undefined && (
              <>
                {Math.min((page - 1) * perPage + 1, totalCount)}–{Math.min(page * perPage, totalCount)} sur{' '}
                <span className="font-semibold text-ink-700">{totalCount}</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page === 1}
              onClick={() => onPageChange((page ?? 1) - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-ink-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page === totalPages}
              onClick={() => onPageChange((page ?? 1) + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
