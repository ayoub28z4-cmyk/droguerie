import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { clientApi } from '@/shared/api/clientApi'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { FormField, Input, Textarea } from '@/shared/ui/FormField'
import { formatMoney } from '@/shared/lib/formatters'
import type { Produit, PaginatedResponse } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const lineSchema = z.object({
  produit_id: z.coerce.number().positive('Produit requis'),
  quantite: z.coerce.number().positive('Qté > 0'),
  prix_unitaire_ht: z.coerce.number().positive(),
})

const schema = z.object({
  date_livraison: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(lineSchema).min(1),
})
type FormData = z.infer<typeof schema>

export function PortailCommandeCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialProduit = searchParams.get('produit')

  const { data: produits } = useQuery({
    queryKey: ['portail', 'produits'],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Produit>>('/produits', { params: { per_page: 500, statut: 'actif' } })
        .then((r) => r.data.data),
  })

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      lignes: [{ produit_id: initialProduit ? Number(initialProduit) : 0, quantite: 1, prix_unitaire_ht: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const lignes = watch('lignes')

  // Set initial price when produits load
  useEffect(() => {
    if (produits && initialProduit) {
      const p = produits.find((pr) => pr.id === Number(initialProduit))
      if (p) setValue('lignes.0.prix_unitaire_ht', p.prix_vente_ht)
    }
  }, [produits, initialProduit, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      clientApi.post('/commandes', { ...data, canal: 'portail' }),
    onSuccess: () => {
      toast.success('Commande passée avec succès !')
      navigate('/portail/commandes')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la commande')),
  })

  const estimatedTotal = lignes.reduce(
    (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix_unitaire_ht) || 0),
    0
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/portail/catalogue')}>
          Retour au catalogue
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Passer une commande</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Card padding="none">
              <div className="flex items-center justify-between p-4 border-b border-ink-100">
                <h2 className="font-semibold text-ink-900">Produits</h2>
                <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => append({ produit_id: 0, quantite: 1, prix_unitaire_ht: 0 })}>
                  Ajouter
                </Button>
              </div>

              <div className="divide-y divide-ink-100">
                {fields.map((field, index) => {
                  const lineErrors = errors.lignes?.[index]
                  return (
                    <div key={field.id} className="p-4 grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="text-xs text-ink-500 font-medium mb-1 block">Produit</label>
                        <select
                          className={`w-full h-9 rounded-[10px] border bg-surface px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${lineErrors?.produit_id ? 'border-danger' : 'border-ink-300'}`}
                          {...register(`lignes.${index}.produit_id`, {
                            onChange: (e) => {
                              const p = produits?.find((pr) => pr.id === Number(e.target.value))
                              if (p) setValue(`lignes.${index}.prix_unitaire_ht`, p.prix_vente_ht)
                            },
                          })}
                        >
                          <option value="">Sélectionner...</option>
                          {produits?.filter((p) => p.statut !== 'rupture').map((p) => (
                            <option key={p.id} value={p.id}>{p.designation}</option>
                          ))}
                        </select>
                        {lineErrors?.produit_id && <p className="text-xs text-danger mt-1">{lineErrors.produit_id.message}</p>}
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-xs text-ink-500 font-medium mb-1 block">Qté</label>
                        <Input type="number" min="1" {...register(`lignes.${index}.quantite`)} error={!!lineErrors?.quantite} />
                        {lineErrors?.quantite && <p className="text-xs text-danger mt-1">{lineErrors.quantite.message}</p>}
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <label className="text-xs text-ink-500 font-medium mb-1 block">P.U. HT</label>
                        <Input type="number" step="0.01" {...register(`lignes.${index}.prix_unitaire_ht`)} error={!!lineErrors?.prix_unitaire_ht} />
                      </div>
                      <div className="col-span-2 text-right pt-6">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatMoney((Number(lignes[index]?.quantite) || 0) * (Number(lignes[index]?.prix_unitaire_ht) || 0))}
                        </p>
                      </div>
                      <div className="col-span-1 pt-6">
                        <Button type="button" variant="ghost" size="icon-sm" className="text-ink-400 hover:text-danger"
                          disabled={fields.length === 1} onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">Détails</h2>
              <div className="space-y-4">
                <FormField label="Date de livraison souhaitée">
                  <Input type="date" {...register('date_livraison')} />
                </FormField>
                <FormField label="Notes / Instructions">
                  <Textarea placeholder="Adresse de livraison, remarques..." {...register('notes')} />
                </FormField>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-ink-600">
                <span>Articles</span>
                <span className="font-medium">{fields.length}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink-900 pt-2 border-t border-ink-100">
                <span>Total estimé HT</span>
                <span className="tabular-nums">{formatMoney(estimatedTotal)}</span>
              </div>
              <p className="text-xs text-ink-400 italic">TVA et total TTC confirmés par notre équipe.</p>
            </div>
            <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
              Valider ma commande
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full mt-2"
              onClick={() => navigate('/portail/catalogue')}>
              Continuer mes achats
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}
