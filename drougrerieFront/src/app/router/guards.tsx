import { Navigate, Outlet } from 'react-router-dom'
import { usePersonnelAuth } from '@/features/auth/personnelAuthStore'
import { useClientAuth } from '@/features/auth/clientAuthStore'

export function PersonnelGuard() {
  const isAuthenticated = usePersonnelAuth((s) => s.isAuthenticated())
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function ClientGuard() {
  const isAuthenticated = useClientAuth((s) => s.isAuthenticated())
  return isAuthenticated ? <Outlet /> : <Navigate to="/portail/login" replace />
}

export function PublicGuard() {
  const isAuthenticated = usePersonnelAuth((s) => s.isAuthenticated())
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export function ClientPublicGuard() {
  const isAuthenticated = useClientAuth((s) => s.isAuthenticated())
  return isAuthenticated ? <Navigate to="/portail/commandes" replace /> : <Outlet />
}

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-2">403</h1>
        <p className="text-ink-500">Accès refusé — vous n'avez pas les droits nécessaires.</p>
      </div>
    </div>
  )
}
