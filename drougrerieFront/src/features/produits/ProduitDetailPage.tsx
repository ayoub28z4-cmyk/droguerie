import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { produitsApi } from './produitsApi'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { FormField, Input, Textarea, SelectNative } from '@/shared/ui/FormField'
import { StockStatusBadge } from '@/shared/ui/Badge'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { ImageUploader, ExistingImages } from '@/shared/ui/ImageUploader'
import { ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import type { Categorie, PaginatedResponse } from '@/shared/types'

const schema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  code_barre: z.string().optional(),
  designation: z.string().min(1, 'Désignation requise'),
  description: z.string().optional(),
  categorie_id: z.coerce.number().positive('Catégorie requise'),
  prix_achat: z.coerce.number().nonnegative(),
  prix_vente_ht: z.coerce.number().positive('Prix requis'),
  tva: z.coerce.number().nonnegative(),
  unite: z.string().min(1, 'Unité requise'),
  stock_minimum: z.coerce.number().nonnegative(),
  stock_maximum: z.coerce.number().nonnegative(),
  statut: z.enum(['actif', 'rupture', 'archive']),
  actif: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export function ProduitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'nouveau'
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])

  const { data: produit, isLoading } = useQuery({
    queryKey: ['produits', Number(id)],
    queryFn: () => produitsApi.get(Number(id)).then((r) => r.data.data),
    enabled: !isNew && !!id,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () =>
      personnelApi.get<PaginatedResponse<Categorie>>('/categories', { params: { per_page: 100 } })
        .then((r) => r.data.data),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  // Attendre que le produit ET les catégories soient chargés avant de peupler le formulaire,
  // sinon le <select> catégorie reçoit sa valeur avant que ses <option> existent dans le DOM.
  useEffect(() => {
    if (!produit || !categories) return
    reset({
      reference: produit.reference,
      code_barre: produit.code_barre ?? '',
      designation: produit.designation,
      description: produit.description ?? '',
      categorie_id: produit.categorie_id,
      prix_achat: produit.prix_achat,
      prix_vente_ht: produit.prix_vente_ht,
      tva: produit.tva,
      unite: produit.unite,
      stock_minimum: produit.stock_minimum,
      stock_maximum: produit.stock_maximum,
      statut: produit.statut,
    })
  }, [produit, categories, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isNew) {
        const fd = new FormData()
        Object.entries(data).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)))
        newFiles.forEach((f) => fd.append('images[]', f))
        return produitsApi.create(fd)
      }
      return produitsApi.update(Number(id), data)
    },
    onSuccess: async (res) => {
      if (!isNew && newFiles.length > 0) {
        await produitsApi.uploadImages(Number(id), newFiles)
        setNewFiles([])
      }
      toast.success(isNew ? 'Produit créé' : 'Produit mis à jour')
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      navigate('/produits')
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.errors) {
        const messages = Object.values(data.errors as Record<string, string[]>).flat().join(' • ')
        toast.error(messages)
      } else {
        toast.error(data?.message ?? 'Erreur lors de la sauvegarde')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => produitsApi.delete(Number(id)),
    onSuccess: () => {
      toast.success('Produit supprimé')
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      navigate('/produits')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (mediaId: number) => produitsApi.deleteImage(Number(id), mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits', Number(id)] })
      toast.success('Image supprimée')
    },
  })

  if (!isNew && isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-ink-200 rounded" /><div className="h-64 bg-ink-200 rounded-[var(--radius)]" /></div>
  }

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau produit' : (produit?.designation ?? '')}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/produits')}>
              Retour
            </Button>
            {!isNew && (
              <Can perm="produits.delete">
                <Button variant="danger-ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
                  Supprimer
                </Button>
              </Can>
            )}
          </div>
        }
      />

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">Informations produit</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Référence" required error={errors.reference?.message}>
                  <Input {...register('reference')} placeholder="REF-001" error={!!errors.reference} />
                </FormField>
                <FormField label="Code-barres" error={errors.code_barre?.message}>
                  <Input {...register('code_barre')} placeholder="Ex: 6111234567890" />
                </FormField>
                <FormField label="Catégorie" required error={errors.categorie_id?.message}>
                  <SelectNative {...register('categorie_id')} error={!!errors.categorie_id}>
                    <option value="">Sélectionner...</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </SelectNative>
                </FormField>
                <FormField label="Désignation" required error={errors.designation?.message} className="sm:col-span-2">
                  <Input {...register('designation')} error={!!errors.designation} />
                </FormField>
                <FormField label="Description" className="sm:col-span-2">
                  <Textarea {...register('description')} rows={3} />
                </FormField>
                <FormField label="Unité" required error={errors.unite?.message}>
                  <Input {...register('unite')} placeholder="kg, m², sac..." error={!!errors.unite} />
                </FormField>
                <FormField label="Statut">
                  <SelectNative {...register('statut')}>
                    <option value="actif">Actif</option>
                    <option value="rupture">Rupture</option>
                    <option value="archive">Archivé</option>
                  </SelectNative>
                </FormField>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">Prix</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Prix d'achat (MAD HT)">
                  <Input type="number" step="0.01" {...register('prix_achat')} />
                </FormField>
                <FormField label="Prix de vente HT" required error={errors.prix_vente_ht?.message}>
                  <Input type="number" step="0.01" {...register('prix_vente_ht')} error={!!errors.prix_vente_ht} />
                </FormField>
                <FormField label="TVA (%)">
                  <Input type="number" step="0.01" {...register('tva')} placeholder="20" />
                </FormField>
              </div>
              {produit && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-4">
                  <span className="text-sm text-ink-500">Prix TTC calculé :</span>
                  <MoneyDisplay amount={produit.prix_vente_ttc} size="lg" color="success" />
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">Seuils de stock</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Stock minimum">
                  <Input type="number" step="1" {...register('stock_minimum')} />
                </FormField>
                <FormField label="Stock maximum">
                  <Input type="number" step="1" {...register('stock_maximum')} />
                </FormField>
              </div>
            </Card>
          </div>

          {/* Right: images + stock */}
          <div className="space-y-4">
            {!isNew && produit && (
              <Card>
                <h2 className="font-semibold text-ink-900 mb-1">Stock actuel</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`font-display text-3xl font-bold tabular-nums ${
                    produit.stock_actuel <= 0 ? 'text-danger' :
                    produit.stock_actuel <= produit.stock_minimum ? 'text-warning' : 'text-ink-900'
                  }`}>
                    {produit.stock_actuel}
                  </span>
                  <div>
                    <span className="text-sm text-ink-500">{produit.unite}</span>
                    <div className="mt-0.5"><StockStatusBadge statut={produit.statut} /></div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h2 className="font-semibold text-ink-900 mb-3">Images</h2>
              {!isNew && produit?.images && (
                <div className="mb-3">
                  <ExistingImages
                    images={produit.images}
                    onDelete={(mediaId) => deleteImageMutation.mutate(mediaId)}
                  />
                </div>
              )}
              <ImageUploader onFilesSelected={setNewFiles} />
            </Card>

            <Button type="submit" size="lg" loading={saveMutation.isPending} leftIcon={<Save className="h-4 w-4" />} className="w-full">
              {isNew ? 'Créer le produit' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le produit"
        description="Cette action est irréversible. Le produit sera supprimé définitivement."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
