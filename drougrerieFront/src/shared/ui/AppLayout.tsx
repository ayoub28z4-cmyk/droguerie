import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SidebarNav } from './SidebarNav'
import { usePersonnelAuth } from '@/features/auth/personnelAuthStore'
import { useStockAlertCount } from '@/features/stock/useStockAlertCount'
import { AlertBadge } from './AlertBadge'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { personnel, logout } = usePersonnelAuth()
  const { data: alertCount = 0 } = useStockAlertCount()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink-900/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'lg:relative fixed inset-y-0 left-0 z-40 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-ink-200/60 flex items-center gap-4 px-5 flex-shrink-0 shadow-[var(--shadow-sm)]">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1.5 rounded-[8px] text-ink-500 hover:bg-ink-100"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
            <input
              placeholder="Rechercher..."
              className="w-full h-9 pl-9 pr-3 rounded-[10px] border border-ink-200 bg-ink-50 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-surface transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Stock alert */}
            <button
              className="relative p-2 rounded-[10px] text-ink-500 hover:bg-ink-100 transition-colors"
              onClick={() => navigate('/stock')}
            >
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5">
                  <AlertBadge count={alertCount} />
                </span>
              )}
            </button>

            {/* User menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[10px] hover:bg-ink-100 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {personnel?.prenom?.[0]}{personnel?.nom?.[0]}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-ink-700">
                    {personnel?.prenom}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="min-w-[180px] bg-surface rounded-[var(--radius)] shadow-[var(--shadow-lg)] border border-ink-200/60 p-1 z-50"
                  sideOffset={6}
                >
                  <DropdownMenu.Label className="px-2 py-1.5 text-xs text-ink-500">
                    {personnel?.email}
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator className="h-px bg-ink-100 my-1" />
                  <DropdownMenu.Item
                    onSelect={logout}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-danger rounded-[8px] cursor-pointer hover:bg-danger-bg focus:outline-none"
                  >
                    Déconnexion
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
