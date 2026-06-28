import type { ReactNode } from 'react'
import { usePermission } from '@/shared/hooks/usePermission'

interface CanProps {
  perm: string
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ perm, children, fallback = null }: CanProps) {
  const can = usePermission()
  return can(perm) ? <>{children}</> : <>{fallback}</>
}
