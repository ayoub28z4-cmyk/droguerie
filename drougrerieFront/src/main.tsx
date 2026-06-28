import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { QueryProvider } from './app/providers/QueryProvider'
import { Router } from './app/router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <Router />
      <Toaster
        position="top-right"
        richColors
        expand={false}
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'rounded-[var(--radius)] shadow-[var(--shadow-lg)] border border-ink-200/60 font-sans text-sm',
            title: 'font-semibold',
          },
        }}
      />
    </QueryProvider>
  </StrictMode>
)
