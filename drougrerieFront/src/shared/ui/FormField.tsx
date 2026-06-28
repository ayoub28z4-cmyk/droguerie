import { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-9 rounded-[10px] border bg-surface px-3 text-sm text-ink-900 placeholder:text-ink-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
          error
            ? 'border-danger focus:ring-danger/30 focus:border-danger'
            : 'border-ink-300 hover:border-ink-400',
          leftIcon && 'pl-9',
          rightIcon && 'pr-9',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          {rightIcon}
        </span>
      )}
    </div>
  )
)
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[80px] rounded-[10px] border bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 resize-y',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
        error
          ? 'border-danger focus:ring-danger/30 focus:border-danger'
          : 'border-ink-300 hover:border-ink-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────────────────
export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const SelectNative = forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full h-9 rounded-[10px] border bg-surface px-3 text-sm text-ink-900 appearance-none',
        'transition-colors duration-150 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
        error
          ? 'border-danger focus:ring-danger/30 focus:border-danger'
          : 'border-ink-300 hover:border-ink-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
SelectNative.displayName = 'SelectNative'
