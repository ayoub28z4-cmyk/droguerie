import type { CommandeStatut } from '@/shared/types'

export interface OrderTransition {
  label: string
  endpoint: string
  color: 'primary' | 'success' | 'danger' | 'secondary'
  perm: string
  confirmRequired: boolean
  confirmMessage?: string
}

const TRANSITIONS: Record<CommandeStatut, OrderTransition[]> = {
  en_attente: [
    {
      label: 'Confirmer',
      endpoint: 'confirmer',
      color: 'primary',
      perm: 'commandes.update',
      confirmRequired: false,
    },
    {
      label: 'Annuler',
      endpoint: 'annuler',
      color: 'danger',
      perm: 'commandes.annuler',
      confirmRequired: true,
      confirmMessage: 'Êtes-vous sûr de vouloir annuler cette commande ?',
    },
  ],
  confirmee: [
    {
      label: 'Mettre en préparation',
      endpoint: 'en-preparation',
      color: 'primary',
      perm: 'commandes.update',
      confirmRequired: false,
    },
    {
      label: 'Annuler',
      endpoint: 'annuler',
      color: 'danger',
      perm: 'commandes.annuler',
      confirmRequired: true,
      confirmMessage: 'Êtes-vous sûr de vouloir annuler cette commande confirmée ?',
    },
  ],
  en_preparation: [
    {
      label: 'Mettre en livraison',
      endpoint: 'en-livraison',
      color: 'primary',
      perm: 'commandes.update',
      confirmRequired: false,
    },
    {
      label: 'Annuler',
      endpoint: 'annuler',
      color: 'danger',
      perm: 'commandes.annuler',
      confirmRequired: true,
      confirmMessage: 'Annuler une commande en préparation ?',
    },
  ],
  en_livraison: [
    {
      label: 'Marquer livrée',
      endpoint: 'livree',
      color: 'success',
      perm: 'commandes.update',
      confirmRequired: false,
    },
  ],
  livree: [
    {
      label: 'Clôturer',
      endpoint: 'cloturer',
      color: 'secondary',
      perm: 'commandes.cloturer',
      confirmRequired: true,
      confirmMessage: 'Clôturer définitivement la commande ?',
    },
  ],
  cloturee: [],
  annulee:  [],
}

export function useOrderTransitions(statut: CommandeStatut) {
  return TRANSITIONS[statut] ?? []
}
