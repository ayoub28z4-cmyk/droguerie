import { usePersonnelAuth } from '@/features/auth/personnelAuthStore'

export function usePermission() {
  const hasPermission = usePersonnelAuth((s) => s.hasPermission)
  return hasPermission
}
