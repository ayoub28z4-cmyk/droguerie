import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface CardProps {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ className, hover, padding = 'md', children, onClick, style }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, boxShadow: '0 8px 24px -4px rgb(15 23 42 / 0.12)' } : undefined}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={style}
      className={cn(
        'bg-surface rounded-(--radius) shadow-(--shadow-md) border border-ink-200/60',
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-5': padding === 'md',
          'p-6': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between mb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display font-semibold text-ink-900 text-base leading-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-ink-500 mt-0.5', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 mt-4 border-t border-ink-100', className)}
      {...props}
    />
  )
}
