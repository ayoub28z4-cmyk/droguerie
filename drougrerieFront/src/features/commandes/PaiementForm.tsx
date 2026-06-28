import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { FormField, Input, SelectNative } from '@/shared/ui/FormField'
import { commandesApi } from './commandesApi'
import { formatMoney } from '@/shared/lib/formatters'
import type { Commande } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const schema = z.object({
  montant: z.coerce.number().positive('Montant requis'),
  mode_paiement: z.enum(['especes', 'cheque', 'virement', 'credit']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface PaiementFormProps {
  commande: Commande
  onClose: () => void
  onSuccess: () => void
}

export function PaiementForm({ commande, onClose, onSuccess }: PaiementFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { montant: commande.reste_a_payer, mode_paiement: 'especes' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      commandesApi.createPaiement({ ...data, commande_id: commande.id }),
    onSuccess: () => {
      toast.success('Paiement enregistré')
      onSuccess()
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement du paiement'),
  })

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title="Enregistrer un paiement"
      description={`Commande ${commande.numero} — Reste à payer : ${formatMoney(commande.reste_a_payer)}`}
      size="sm"
    >
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField label="Montant (MAD)" error={errors.montant?.message} required>
          <Input
            type="number"
            step="0.01"
            error={!!errors.montant}
            {...register('montant')}
          />
        </FormField>

        <FormField label="Mode de paiement" required>
          <SelectNative {...register('mode_paiement')}>
            <option value="especes">Espèces</option>
            <option value="cheque">Chèque</option>
            <option value="virement">Virement</option>
            <option value="credit">Crédit</option>
          </SelectNative>
        </FormField>

        <FormField label="Référence" error={errors.reference?.message}>
          <Input placeholder="N° chèque, virement..." {...register('reference')} />
        </FormField>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
