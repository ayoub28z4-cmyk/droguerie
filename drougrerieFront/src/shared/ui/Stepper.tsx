import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import type { CommandeStatut } from '@/shared/types'

const COMMANDE_STEPS: { statut: CommandeStatut; label: string }[] = [
  { statut: 'en_attente',     label: 'Attente' },
  { statut: 'confirmee',      label: 'Confirmée' },
  { statut: 'en_preparation', label: 'Préparation' },
  { statut: 'en_livraison',   label: 'Livraison' },
  { statut: 'livree',         label: 'Livrée' },
  { statut: 'cloturee',       label: 'Clôturée' },
]

const STATUT_ORDER = COMMANDE_STEPS.map((s) => s.statut)

interface CommandeStepperProps {
  statut: CommandeStatut
}

export function CommandeStepper({ statut }: CommandeStepperProps) {
  if (statut === 'annulee') {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="w-6 h-6 rounded-full bg-danger flex items-center justify-center">
          <span className="text-white text-xs font-bold">✕</span>
        </span>
        <span className="text-sm font-medium text-danger">Commande annulée</span>
      </div>
    )
  }

  const currentIndex = STATUT_ORDER.indexOf(statut)

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-2">
      {COMMANDE_STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={step.statut} className="flex items-center min-w-0 flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                  isDone && 'bg-success border-success text-white',
                  isCurrent && 'bg-brand-500 border-brand-500 text-white scale-110',
                  isPending && 'bg-surface border-ink-300 text-ink-400'
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  isDone && 'text-success font-medium',
                  isCurrent && 'text-brand-600 font-semibold',
                  isPending && 'text-ink-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < COMMANDE_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mt-[-20px] rounded-full overflow-hidden bg-ink-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                  className="h-full bg-success rounded-full"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
