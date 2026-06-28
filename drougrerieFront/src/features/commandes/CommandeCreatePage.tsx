import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { commandesApi } from './commandesApi'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { FormField, Input, Textarea, SelectNative } from '@/shared/ui/FormField'
import { formatMoney } from '@/shared/lib/formatters'
import type { Client, Produit, PaginatedResponse } from '@/shared/types'
import { getApiErrorMessage } from '@/shared/lib/apiError'

const lineSchema = z.object({
  produit_id: z.coerce.number().positive('Produit requis'),
  quantite: z.coerce.number().positive('Qté > 0'),
  prix_unitaire_ht: z.coerce.number().positive('Prix requis'),
})

const schema = z.object({
  client_id: z.coerce.number().positive('Client requis'),
  canal: z.enum(['magasin', 'portail']),
  date_livraison: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(lineSchema).min(1, 'Au moins 1 ligne requise'),
})
type FormData = z.infer<typeof schema>

export function CommandeCreatePage() {
  const navigate = useNavigate()
  const [clientSearch, setClientSearch] = useState('')
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      canal: 'magasin',
      lignes: [{ produit_id: 0, quantite: 1, prix_unitaire_ht: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const lignes = watch('lignes')

  // Clients autocomplete
  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'autocomplete', clientSearch],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Client>>('/clients', {
        params: { search: clientSearch, per_page: 10, actif: 1 },
      }).then((r) => r.data.data),
    enabled: clientSearch.length >= 2,
  })

  // Produits autocomplete (per line)
  const { data: produits } = useQuery({
    queryKey: ['produits', 'autocomplete'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Produit>>('/produits', {
        params: { per_page: 100, statut: 'actif' },
      }).then((r) => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => commandesApi.create(data),
    onSuccess: (res) => {
      toast.success('Commande créée avec succès')
      navigate(`/commandes/${res.data.data.id}`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la création de la commande')),
  })

  // Estimated totals (display only — real totals come from API)
  const estimatedHT = lignes.reduce(
    (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix_unitaire_ht) || 0),
    0
  )

  return (
    <div>
      <PageHeader
        title="Nouvelle commande"
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/commandes')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Client + meta */}
            <Card>
              <h2 className="font-display font-semibold text-base text-ink-900 mb-4">Informations générales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Client" required error={errors.client_id?.message} className="sm:col-span-2">
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un client..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value)
                        setClientDropdownOpen(true)
                      }}
                      onBlur={() => setTimeout(() => setClientDropdownOpen(false), 150)}
                    />
                    {clientDropdownOpen && clientsData && clientsData.length > 0 && clientSearch.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface rounded-[var(--radius)] shadow-[var(--shadow-lg)] border border-ink-200 overflow-hidden">
                        {clientsData.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50 transition-colors text-left"
                            onClick={() => {
                              setValue('client_id', c.id)
                              setClientSearch(c.raison_sociale ?? `${c.prenom ?? ''} ${c.nom}`.trim())
                              setClientDropdownOpen(false)
                            }}
                          >
                            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand-600 text-xs font-bold">{c.nom[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink-900">
                                {c.raison_sociale ?? `${c.prenom ?? ''} ${c.nom}`.trim()}
                              </p>
                              <p className="text-xs text-ink-500">{c.telephone}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...register('client_id')} />
                </FormField>

                <FormField label="Canal de vente">
                  <SelectNative {...register('canal')}>
                    <option value="magasin">Magasin</option>
                    <option value="portail">Portail</option>
                  </SelectNative>
                </FormField>

                <FormField label="Date de livraison prévue">
                  <Input type="date" {...register('date_livraison')} />
                </FormField>

                <FormField label="Notes" className="sm:col-span-2">
                  <Textarea placeholder="Instructions de livraison, remarques..." {...register('notes')} />
                </FormField>
              </div>
            </Card>

            {/* Lignes */}
            <Card padding="none">
              <div className="flex items-center justify-between p-4 border-b border-ink-100">
                <h2 className="font-display font-semibold text-base text-ink-900">Lignes de commande</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => append({ produit_id: 0, quantite: 1, prix_unitaire_ht: 0 })}
                >
                  Ajouter
                </Button>
              </div>

              {errors.lignes && typeof errors.lignes === 'object' && 'message' in errors.lignes && (
                <p className="text-xs text-danger px-4 pt-2">{errors.lignes.message as string}</p>
              )}

              <div className="divide-y divide-ink-100">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 flex gap-3 items-start">
                    {/* Produit select */}
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-ink-500 font-medium mb-1 block">Produit</label>
                      <select
                        className="w-full h-9 rounded-[10px] border border-ink-300 bg-surface px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        {...register(`lignes.${index}.produit_id`, {
                          onChange: (e) => {
                            const produit = produits?.find((p) => p.id === Number(e.target.value))
                            if (produit) {
                              setValue(`lignes.${index}.prix_unitaire_ht`, produit.prix_vente_ht)
                            }
                          },
                        })}
                      >
                        <option value="">Sélectionner un produit...</option>
                        {produits?.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.designation} — {formatMoney(p.prix_vente_ht)} HT
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantité */}
                    <div className="w-24 flex-shrink-0">
                      <label className="text-xs text-ink-500 font-medium mb-1 block">Qté</label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        error={!!errors.lignes?.[index]?.quantite}
                        {...register(`lignes.${index}.quantite`)}
                      />
                    </div>

                    {/* Prix HT */}
                    <div className="w-32 flex-shrink-0">
                      <label className="text-xs text-ink-500 font-medium mb-1 block">Prix HT (MAD)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        error={!!errors.lignes?.[index]?.prix_unitaire_ht}
                        {...register(`lignes.${index}.prix_unitaire_ht`)}
                      />
                    </div>

                    {/* Sous-total */}
                    <div className="w-28 flex-shrink-0 text-right">
                      <label className="text-xs text-ink-500 font-medium mb-1 block">Sous-total</label>
                      <p className="h-9 flex items-center justify-end text-sm font-semibold text-ink-900 tabular-nums">
                        {formatMoney(
                          (Number(lignes[index]?.quantite) || 0) *
                          (Number(lignes[index]?.prix_unitaire_ht) || 0)
                        )}
                      </p>
                    </div>

                    {/* Delete */}
                    <div className="flex-shrink-0 mt-5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-ink-400 hover:text-danger"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card>
              <h2 className="font-display font-semibold text-base text-ink-900 mb-4">Récapitulatif</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Lignes</span>
                  <span className="font-medium text-ink-900">{fields.length}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Total HT estimé</span>
                  <span className="font-semibold text-ink-900 tabular-nums">{formatMoney(estimatedHT)}</span>
                </div>
                <p className="text-xs text-ink-400 italic mt-2">
                  Les totaux définitifs (TVA, TTC) sont calculés par le serveur.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                loading={mutation.isPending}
                className="w-full mt-4"
              >
                Créer la commande
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mt-2"
                onClick={() => navigate('/commandes')}
              >
                Annuler
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
