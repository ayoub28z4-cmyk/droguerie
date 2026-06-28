import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, ShoppingCart, BookOpen, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useClientAuth } from '@/features/auth/clientAuthStore'

export function PortailLayout() {
  const { client, logout } = useClientAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/portail/catalogue', label: 'Catalogue', icon: <BookOpen className="h-4 w-4" /> },
    { to: '/portail/commandes', label: 'Mes commandes', icon: <ShoppingCart className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-100/30 via-bg to-accent-100/20">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-ink-200/60 shadow-[var(--shadow-sm)]">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] gradient-brand flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-ink-900 text-sm leading-none">Droguerie BTP</p>
              <p className="text-xs text-ink-400 leading-none">Espace client</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-100 text-brand-600' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                )}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/portail/commandes/nouvelle">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-[10px] bg-brand-500 text-white text-sm font-semibold shadow-brand hover:bg-brand-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Commander
              </motion.button>
            </NavLink>

            {/* User */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{client?.nom?.[0]}</span>
              </div>
              <span className="text-sm font-medium text-ink-700">{client?.nom}</span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-[8px] text-ink-500 hover:bg-ink-100 hover:text-danger transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-1.5 rounded-[8px] text-ink-500 hover:bg-ink-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden border-t border-ink-100 bg-surface px-4 py-3 space-y-1"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium',
                  isActive ? 'bg-brand-100 text-brand-600' : 'text-ink-600'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-[90%] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
