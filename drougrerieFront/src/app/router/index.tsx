import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppLayout } from '@/shared/ui/AppLayout'
import { PersonnelGuard, ClientGuard, PublicGuard, ClientPublicGuard, AccessDenied } from './guards'
import { LoginPage } from '@/features/auth/LoginPage'
import { ClientLoginPage } from '@/features/auth/ClientLoginPage'
import { ClientRegisterPage } from '@/features/auth/ClientRegisterPage'
import { LandingPage } from '@/features/landing/LandingPage'

// Lazy load all feature pages
const DashboardPage        = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const CommandesPage        = lazy(() => import('@/features/commandes/CommandesPage').then(m => ({ default: m.CommandesPage })))
const CommandeDetailPage   = lazy(() => import('@/features/commandes/CommandeDetailPage').then(m => ({ default: m.CommandeDetailPage })))
const CommandeCreatePage   = lazy(() => import('@/features/commandes/CommandeCreatePage').then(m => ({ default: m.CommandeCreatePage })))
const ProduitsPage         = lazy(() => import('@/features/produits/ProduitsPage').then(m => ({ default: m.ProduitsPage })))
const ProduitDetailPage    = lazy(() => import('@/features/produits/ProduitDetailPage').then(m => ({ default: m.ProduitDetailPage })))
const ProduitBarcodePage   = lazy(() => import('@/features/produits/ProduitBarcodePage').then(m => ({ default: m.ProduitBarcodePage })))
const CategoriesPage       = lazy(() => import('@/features/categories/CategoriesPage').then(m => ({ default: m.CategoriesPage })))
const ClientsPage          = lazy(() => import('@/features/clients/ClientsPage').then(m => ({ default: m.ClientsPage })))
const ClientDetailPage     = lazy(() => import('@/features/clients/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })))
const InscriptionsPage     = lazy(() => import('@/features/clients/InscriptionsPage').then(m => ({ default: m.InscriptionsPage })))
const FournisseursPage     = lazy(() => import('@/features/fournisseurs/FournisseursPage').then(m => ({ default: m.FournisseursPage })))
const PaiementsPage        = lazy(() => import('@/features/paiements/PaiementsPage').then(m => ({ default: m.PaiementsPage })))
const StockPage            = lazy(() => import('@/features/stock/StockPage').then(m => ({ default: m.StockPage })))
const ApprosPage           = lazy(() => import('@/features/approvisionnements/ApprosPage').then(m => ({ default: m.ApprosPage })))
const ApproDetailPage      = lazy(() => import('@/features/approvisionnements/ApproDetailPage').then(m => ({ default: m.ApproDetailPage })))
const InventairesPage      = lazy(() => import('@/features/inventaires/InventairesPage').then(m => ({ default: m.InventairesPage })))
const PersonnelPage        = lazy(() => import('@/features/personnel/PersonnelPage').then(m => ({ default: m.PersonnelPage })))
const RapportsPage         = lazy(() => import('@/features/rapports/RapportsPage').then(m => ({ default: m.RapportsPage })))
const ActivitePage         = lazy(() => import('@/features/activite/ActivitePage').then(m => ({ default: m.ActivitePage })))
const CaissePage           = lazy(() => import('@/features/caisse/CaissePage').then(m => ({ default: m.CaissePage })))

// Portail client
const PortailLayout        = lazy(() => import('@/features/portail/PortailLayout').then(m => ({ default: m.PortailLayout })))
const CataloguePage        = lazy(() => import('@/features/portail/CataloguePage').then(m => ({ default: m.CataloguePage })))
const PortailCommandesPage = lazy(() => import('@/features/portail/PortailCommandesPage').then(m => ({ default: m.PortailCommandesPage })))
const PortailCommandeCreate= lazy(() => import('@/features/portail/PortailCommandeCreate').then(m => ({ default: m.PortailCommandeCreate })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )
}

const router = createBrowserRouter([
  // ── Landing ────────────────────────────────────────────
  { path: '/', element: <LandingPage /> },

  // ── Personnel public routes ─────────────────────────────
  {
    element: <PublicGuard />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // ── Personnel protected routes ──────────────────────────
  {
    element: <PersonnelGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: '/commandes', element: <Suspense fallback={<PageLoader />}><CommandesPage /></Suspense> },
          { path: '/commandes/nouvelle', element: <Suspense fallback={<PageLoader />}><CommandeCreatePage /></Suspense> },
          { path: '/commandes/:id', element: <Suspense fallback={<PageLoader />}><CommandeDetailPage /></Suspense> },
          { path: '/produits', element: <Suspense fallback={<PageLoader />}><ProduitsPage /></Suspense> },
          { path: '/produits/:id', element: <Suspense fallback={<PageLoader />}><ProduitDetailPage /></Suspense> },
          { path: '/produits/:id/code-barre', element: <Suspense fallback={<PageLoader />}><ProduitBarcodePage /></Suspense> },
          { path: '/categories', element: <Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense> },
          { path: '/clients', element: <Suspense fallback={<PageLoader />}><ClientsPage /></Suspense> },
          { path: '/clients/inscriptions', element: <Suspense fallback={<PageLoader />}><InscriptionsPage /></Suspense> },
          { path: '/clients/:id', element: <Suspense fallback={<PageLoader />}><ClientDetailPage /></Suspense> },
          { path: '/fournisseurs', element: <Suspense fallback={<PageLoader />}><FournisseursPage /></Suspense> },
          { path: '/paiements', element: <Suspense fallback={<PageLoader />}><PaiementsPage /></Suspense> },
          { path: '/stock', element: <Suspense fallback={<PageLoader />}><StockPage /></Suspense> },
          { path: '/approvisionnements', element: <Suspense fallback={<PageLoader />}><ApprosPage /></Suspense> },
          { path: '/approvisionnements/:id', element: <Suspense fallback={<PageLoader />}><ApproDetailPage /></Suspense> },
          { path: '/inventaires', element: <Suspense fallback={<PageLoader />}><InventairesPage /></Suspense> },
          { path: '/personnel', element: <Suspense fallback={<PageLoader />}><PersonnelPage /></Suspense> },
          { path: '/rapports', element: <Suspense fallback={<PageLoader />}><RapportsPage /></Suspense> },
          { path: '/activite', element: <Suspense fallback={<PageLoader />}><ActivitePage /></Suspense> },
          { path: '/caisse',   element: <Suspense fallback={<PageLoader />}><CaissePage /></Suspense> },
        ],
      },
    ],
  },

  // ── Portail client public ───────────────────────────────
  {
    element: <ClientPublicGuard />,
    children: [
      { path: '/portail/login', element: <ClientLoginPage /> },
      { path: '/portail/inscription', element: <ClientRegisterPage /> },
    ],
  },

  // ── Portail client protected ────────────────────────────
  {
    element: <ClientGuard />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><PortailLayout /></Suspense>,
        children: [
          { path: '/portail/catalogue', element: <Suspense fallback={<PageLoader />}><CataloguePage /></Suspense> },
          { path: '/portail/commandes', element: <Suspense fallback={<PageLoader />}><PortailCommandesPage /></Suspense> },
          { path: '/portail/commandes/nouvelle', element: <Suspense fallback={<PageLoader />}><PortailCommandeCreate /></Suspense> },
        ],
      },
    ],
  },

  // 403
  { path: '/403', element: <AccessDenied /> },

  // Fallback
  { path: '*', element: <div className="flex items-center justify-center min-h-screen"><div className="text-center"><h1 className="font-display text-4xl font-bold text-ink-900">404</h1><p className="text-ink-500 mt-2">Page introuvable</p></div></div> },
])

export function Router() {
  return <RouterProvider router={router} />
}
