import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Plus, CreditCard, Printer, FileText } from 'lucide-react'
import { commandesApi } from './commandesApi'
import { CommandeStatusBadge, PaiementStatusBadge } from '@/shared/ui/Badge'
import { CommandeStepper } from '@/shared/ui/Stepper'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { Button } from '@/shared/ui/Button'
import { Card, CardTitle } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/Modal'
import { Can } from '@/shared/ui/Can'
import { usePermission } from '@/shared/hooks/usePermission'
import { useOrderTransitions } from '@/shared/hooks/useOrderTransitions'
import { formatDate, formatDateTime, formatMoney } from '@/shared/lib/formatters'
import { getApiErrorMessage } from '@/shared/lib/apiError'
import { PaiementForm } from './PaiementForm'
import { printDocument } from '@/shared/lib/printDocument'
import { factureHtml, bonLivraisonHtml, type PrintFormat } from './printTemplates'

export function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const can = usePermission()

  const [confirmAction, setConfirmAction] = useState<{ endpoint: string; label: string; message: string } | null>(null)
  const [showPaiementForm, setShowPaiementForm] = useState(false)
  const [printFormat, setPrintFormat] = useState<PrintFormat>('A4')

  const { data: commande, isLoading } = useQuery({
    queryKey: ['commandes', Number(id)],
    queryFn: () => commandesApi.get(Number(id)).then((r) => r.data.data),
    enabled: !!id,
  })

  const transitions = useOrderTransitions(commande?.statut ?? 'en_attente')

  const transitionMutation = useMutation({
    mutationFn: (endpoint: string) => commandesApi.transition(Number(id), endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes', Number(id)] })
      queryClient.invalidateQueries({ queryKey: ['commandes'] })
      toast.success('Statut mis à jour')
      setConfirmAction(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour du statut')),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-ink-200 rounded" />
        <div className="h-32 bg-ink-200 rounded-[var(--radius)]" />
        <div className="h-64 bg-ink-200 rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!commande) return null

  const paiementProgress = commande.montant_ttc > 0
    ? (commande.montant_paye / commande.montant_ttc) * 100
    : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/commandes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-bold text-ink-900">{commande.numero}</h1>
            <CommandeStatusBadge statut={commande.statut} />
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              commande.canal === 'portail' ? 'bg-accent-100 text-accent-600' : 'bg-ink-100 text-ink-600'
            }`}>
              {commande.canal === 'portail' ? 'Portail' : 'Magasin'}
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">{formatDateTime(commande.created_at)}</p>
        </div>
        {/* Transition buttons */}
        <div className="flex gap-2 flex-wrap">
          {transitions
            .filter((t) => can(t.perm))
            .map((t) => (
              <Button
                key={t.endpoint}
                variant={t.color === 'danger' ? 'danger' : t.color === 'success' ? 'success' : t.color === 'secondary' ? 'secondary' : 'primary'}
                size="sm"
                loading={transitionMutation.isPending && confirmAction?.endpoint === t.endpoint}
                onClick={() => {
                  if (t.confirmRequired) {
                    setConfirmAction({ endpoint: t.endpoint, label: t.label, message: t.confirmMessage ?? '' })
                  } else {
                    transitionMutation.mutate(t.endpoint)
                  }
                }}
              >
                {t.label}
              </Button>
            ))}
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <CommandeStepper statut={commande.statut} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: lignes + totaux */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lignes */}
          <Card padding="none">
            <div className="p-4 border-b border-ink-100">
              <CardTitle>Lignes de commande</CardTitle>
            </div>
            <div className="divide-y divide-ink-100">
              {commande.lignes.map((ligne) => (
                <div key={ligne.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-[8px] bg-ink-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {ligne.produit?.images?.[0] ? (
                      <img src={ligne.produit.images[0].thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-ink-400 text-xs font-bold">{ligne.quantite}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{ligne.produit?.designation ?? `Produit #${ligne.produit_id}`}</p>
                    <p className="text-xs text-ink-500">
                      {ligne.quantite} {ligne.produit?.unite ?? 'u.'} × {formatMoney(ligne.prix_unitaire_ht)} HT
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <MoneyDisplay amount={ligne.montant_ttc} size="sm" />
                    <p className="text-xs text-ink-500">TTC</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totaux */}
            <div className="border-t border-ink-200 p-4 space-y-1.5">
              <div className="flex justify-between text-sm text-ink-600">
                <span>Sous-total HT</span>
                <MoneyDisplay amount={commande.montant_ht} size="sm" color="muted" />
              </div>
              <div className="flex justify-between text-sm text-ink-600">
                <span>TVA</span>
                <MoneyDisplay amount={commande.tva} size="sm" color="muted" />
              </div>
              <div className="flex justify-between text-base font-bold text-ink-900 pt-1.5 border-t border-ink-100">
                <span>Total TTC</span>
                <MoneyDisplay amount={commande.montant_ttc} size="lg" />
              </div>
            </div>
          </Card>

          {/* Paiements */}
          <Card padding="none">
            <div className="p-4 border-b border-ink-100 flex items-center justify-between">
              <CardTitle>Paiements</CardTitle>
              <Can perm="paiements.create">
                {commande.reste_a_payer > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => setShowPaiementForm(true)}
                  >
                    Ajouter
                  </Button>
                )}
              </Can>
            </div>

            {/* Progress */}
            <div className="px-4 py-3 bg-ink-50/50">
              <div className="flex justify-between text-xs text-ink-600 mb-1.5">
                <span>Progression du paiement</span>
                <span className="font-semibold">{paiementProgress.toFixed(0)}%</span>
              </div>
              <ProgressBar
                value={commande.montant_paye}
                max={commande.montant_ttc}
                color={paiementProgress >= 100 ? 'success' : paiementProgress > 50 ? 'brand' : 'warning'}
              />
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-ink-500">Payé : <MoneyDisplay amount={commande.montant_paye} size="sm" color="success" /></span>
                <span className="text-ink-500">Reste : <MoneyDisplay amount={commande.reste_a_payer} size="sm" color={commande.reste_a_payer > 0 ? 'danger' : 'success'} /></span>
              </div>
            </div>

            {(commande.paiements ?? []).length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-6">Aucun paiement enregistré</p>
            ) : (
              <div className="divide-y divide-ink-100">
                {(commande.paiements ?? []).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{formatMoney(p.montant)}</p>
                      <p className="text-xs text-ink-500">
                        {p.mode_paiement} · {formatDate(p.created_at)}
                        {p.reference && ` · Réf: ${p.reference}`}
                      </p>
                    </div>
                    <PaiementStatusBadge statut={p.statut} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: infos client + meta */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Client</CardTitle>
            {commande.client ? (
              <div className="space-y-2">
                <p className="font-semibold text-ink-900">
                  {commande.client.raison_sociale ?? `${commande.client.prenom ?? ''} ${commande.client.nom}`.trim()}
                </p>
                {commande.client.telephone && <p className="text-sm text-ink-600">{commande.client.telephone}</p>}
                {commande.client.email && <p className="text-sm text-ink-500">{commande.client.email}</p>}
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  commande.client.type_client === 'entreprise' ? 'bg-brand-100 text-brand-600' :
                  commande.client.type_client === 'professionnel' ? 'bg-accent-100 text-accent-600' :
                  'bg-ink-100 text-ink-600'
                }`}>
                  {commande.client.type_client}
                </span>
              </div>
            ) : (
              <p className="text-sm text-ink-400">Aucun client associé</p>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-3">Documents</CardTitle>

            {/* Sélecteur de format */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs text-ink-500 mr-1">Format :</span>
              {(['A4', 'A5'] as PrintFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setPrintFormat(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    printFormat === f
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'border-ink-200 text-ink-500 hover:border-ink-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                leftIcon={<Printer className="h-3.5 w-3.5" />}
                onClick={() => printDocument(factureHtml(commande, printFormat))}
              >
                Imprimer facture
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                leftIcon={<FileText className="h-3.5 w-3.5" />}
                onClick={() => printDocument(bonLivraisonHtml(commande, printFormat))}
              >
                Bon de livraison
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Détails</CardTitle>
            <dl className="space-y-2 text-sm">
              {commande.date_livraison && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Livraison prévue</dt>
                  <dd className="font-medium text-ink-900">{formatDate(commande.date_livraison)}</dd>
                </div>
              )}
              {commande.notes && (
                <div>
                  <dt className="text-ink-500 mb-1">Notes</dt>
                  <dd className="text-ink-700 text-xs bg-ink-50 rounded-[8px] p-2">{commande.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.label ?? ''}
        description={confirmAction?.message ?? 'Confirmer cette action ?'}
        confirmLabel={confirmAction?.label}
        variant={confirmAction?.endpoint === 'annuler' ? 'danger' : 'primary'}
        loading={transitionMutation.isPending}
        onConfirm={() => confirmAction && transitionMutation.mutate(confirmAction.endpoint)}
      />

      {/* Paiement form modal */}
      {showPaiementForm && commande && (
        <PaiementForm
          commande={commande}
          onClose={() => setShowPaiementForm(false)}
          onSuccess={() => {
            setShowPaiementForm(false)
            queryClient.invalidateQueries({ queryKey: ['commandes', Number(id)] })
          }}
        />
      )}
    </div>
  )
}
