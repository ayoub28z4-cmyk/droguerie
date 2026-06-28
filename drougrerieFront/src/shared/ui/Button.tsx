import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-brand/30 shadow-md',
        secondary:
          'bg-ink-100 text-ink-900 hover:bg-ink-200 active:bg-ink-300 border border-ink-200',
        outline:
          'border border-ink-300 text-ink-700 bg-surface hover:bg-ink-50 hover:border-ink-400',
        ghost:
          'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
        danger:
          'bg-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
        'danger-ghost':
          'text-danger hover:bg-danger-bg',
        success:
          'bg-success text-white hover:bg-emerald-600 shadow-sm',
      },
      size: {
        xs:  'h-7  px-2.5 text-xs  rounded-[8px]',
        sm:  'h-8  px-3   text-sm  rounded-[10px]',
        md:  'h-9  px-4   text-sm  rounded-[12px]',
        lg:  'h-11 px-5   text-base rounded-[12px]',
        xl:  'h-12 px-6   text-base rounded-[14px]',
        icon:'h-9  w-9        rounded-[12px] p-0',
        'icon-sm': 'h-8 w-8  rounded-[10px] p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <motion.div
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ duration: 0.1 }}
        className="inline-flex"
      >
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : leftIcon ? (
            <span className="flex-shrink-0">{leftIcon}</span>
          ) : null}
          {children}
          {!loading && rightIcon && (
            <span className="flex-shrink-0">{rightIcon}</span>
          )}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'

export { buttonVariants }
