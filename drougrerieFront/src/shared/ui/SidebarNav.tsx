import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck,
  CreditCard, Boxes, ClipboardList, FileText, UserCog,
  ChevronLeft, ChevronRight, Store, BarChart3, Tags,
  LogOut, Activity, Scan, UserPlus
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { usePersonnelAuth } from '@/features/auth/personnelAuthStore'
import { AlertBadge } from './AlertBadge'
import { usePermission } from '@/shared/hooks/usePermission'

import { useStockAlertCount } from '@/features/stock/useStockAlertCount'
import { useInscriptionCount } from '@/features/clients/useInscriptionCount'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  perm?: string
  badge?: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/dashboard',         label: 'Tableau de bord',   icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  { to: '/caisse',            label: 'Caisse',             icon: <Scan            className="h-4.5 w-4.5" />, perm: 'commandes.create' },
  { to: '/commandes',         label: 'Commandes',          icon: <ShoppingCart    className="h-4.5 w-4.5" />, perm: 'commandes.view' },
  { to: '/produits',          label: 'Produits',           icon: <Package         className="h-4.5 w-4.5" />, perm: 'produits.view' },
  { to: '/categories',        label: 'Catégories',         icon: <Tags            className="h-4.5 w-4.5" />, perm: 'categories.view' },
  { to: '/clients',           label: 'Clients',            icon: <Users           className="h-4.5 w-4.5" />, perm: 'clients.view' },
  { to: '/clients/inscriptions', label: 'Inscriptions',   icon: <UserPlus        className="h-4.5 w-4.5" />, perm: 'clients.view' },
  { to: '/fournisseurs',      label: 'Fournisseurs',       icon: <Truck           className="h-4.5 w-4.5" />, perm: 'fournisseurs.view' },
  { to: '/paiements',         label: 'Paiements',          icon: <CreditCard      className="h-4.5 w-4.5" />, perm: 'paiements.view' },
  { to: '/stock',             label: 'Stock',              icon: <Boxes           className="h-4.5 w-4.5" />, perm: 'stock.view' },
  { to: '/approvisionnements',label: 'Approvisionnements', icon: <ClipboardList   className="h-4.5 w-4.5" />, perm: 'approvisionnements.view' },
  { to: '/inventaires',       label: 'Inventaires',        icon: <FileText        className="h-4.5 w-4.5" />, perm: 'inventaires.view' },
  { to: '/rapports',          label: 'Rapports',           icon: <BarChart3       className="h-4.5 w-4.5" />, perm: 'rapports.view' },
  { to: '/activite',          label: 'Journal d\'activité',icon: <Activity        className="h-4.5 w-4.5" />, perm: 'rapports.view' },
  { to: '/personnel',         label: 'Personnel',          icon: <UserCog         className="h-4.5 w-4.5" />, perm: 'personnel.view' },
]

interface SidebarNavProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function SidebarNav({ collapsed = false, onToggle }: SidebarNavProps) {
  const can = usePermission()
  const { personnel, logout } = usePersonnelAuth()
  const { data: alertCount = 0 } = useStockAlertCount()
  const { data: inscriptionCount = 0 } = useInscriptionCount()

  const visibleItems = navItems.map((item) => {
    if (item.to === '/stock') {
      return { ...item, badge: <AlertBadge count={alertCount} /> }
    }
    if (item.to === '/clients/inscriptions') {
      return { ...item, badge: <AlertBadge count={inscriptionCount} /> }
    }
    return item
  }).filter((item) => !item.perm || can(item.perm))

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'bg-ink-900 border-r border-ink-800',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-ink-800 flex-shrink-0', collapsed && 'justify-center')}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] gradient-brand flex items-center justify-center flex-shrink-0">
              <Store className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight">Droguerie</p>
              <p className="text-xs text-ink-400 leading-tight">BTP Pro</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-[10px] gradient-brand flex items-center justify-center">
            <Store className="h-4.5 w-4.5 text-white" />
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => (
          <SidebarItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-ink-800 p-2 flex-shrink-0">
        {!collapsed && personnel && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {personnel.prenom?.[0]}{personnel.nom?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{personnel.prenom} {personnel.nom}</p>
              <p className="text-ink-400 text-xs truncate">{personnel.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-ink-400 hover:text-white hover:bg-ink-800 transition-colors text-sm',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-ink-400 hover:text-white hover:bg-ink-800 transition-colors text-sm mt-0.5',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation()
  const isActive = item.to === '/clients'
    ? location.pathname === '/clients' || (location.pathname.startsWith('/clients/') && !location.pathname.startsWith('/clients/inscriptions'))
    : location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/')

  return (
    <NavLink
      to={item.to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-all duration-150 relative group',
        isActive
          ? 'bg-ink-800/80 text-white'
          : 'text-ink-400 hover:text-white hover:bg-ink-800/50',
        collapsed && 'justify-center px-2'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {!collapsed && item.badge && <span className="ml-auto">{item.badge}</span>}
      {collapsed && item.badge && (
        <span className="absolute -top-0.5 -right-0.5">{item.badge}</span>
      )}
      {/* Tooltip on collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-ink-800 text-white text-xs rounded-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
          {item.label}
        </div>
      )}
    </NavLink>
  )
}
