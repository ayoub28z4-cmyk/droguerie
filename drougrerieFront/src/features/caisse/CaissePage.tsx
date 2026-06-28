import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Scan, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Banknote, Building2, Receipt, Printer, Search,
} from 'lucide-react'
import { personnelApi } from '@/shared/api/personnelApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/FormField'
import { MoneyDisplay } from '@/shared/ui/MoneyDisplay'
import { printDocument } from '@/shared/lib/printDocument'
import { ticketCaisseHtml } from '@/features/commandes/printTemplates'
import type { CartLine } from '@/features/commandes/printTemplates'
import type { PaiementMode, Produit } from '@/shared/types'

interface VenteRapidePayload {
  lignes: { produit_id: number; quantite: number }[]
  mode_paiement: PaiementMode
  montant_recu?: number
  notes?: string
}

interface VenteRapideResult {
  numero: string
  montant_ttc: number
  monnaie?: number | null
}

const MODE_LABELS: Record<PaiementMode, string> = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement',
  credit: 'Crédit',
}

const MODE_ICONS: Record<PaiementMode, React.ReactNode> = {
  especes: <Banknote className="h-4 w-4" />,
  cheque:  <Receipt  className="h-4 w-4" />,
  virement:<Building2 className="h-4 w-4" />,
  credit:  <CreditCard className="h-4 w-4" />,
}

export function CaissePage() {
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [searching, setSearching] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [mode, setMode] = useState<PaiementMode>('especes')
  const [montantRecu, setMontantRecu] = useState('')
  const [lastVente, setLastVente] = useState<VenteRapideResult | null>(null)
  const [lastCart, setLastCart] = useState<CartLine[]>([])

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Produit[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef  = useRef<HTMLInputElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus sur l'input sauf quand la modal paiement est ouverte
  useEffect(() => {
    if (!payOpen) inputRef.current?.focus()
  }, [payOpen])

  // Debounce suggestions quand query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await personnelApi.get<{ data: Produit[] }>('/caisse/suggestions', {
          params: { q: query.trim() },
        })
        const list = res.data.data ?? []
        setSuggestions(list)
        setShowSuggestions(list.length > 0)
        setActiveIdx(-1)
      } catch {
        // silencieux — l'utilisateur peut toujours presser Entrée
      }
    }, 280)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const total = cart.reduce(
    (s, l) => s + parseFloat(l.produit.prix_vente_ttc as any) * l.quantite,
    0,
  )

  const addToCart = useCallback((produit: Produit) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.produit.id === produit.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantite: next[idx].quantite + 1 }
        return next
      }
      return [...prev, { produit, quantite: 1 }]
    })
    toast.success(`${produit.designation} ajouté`, { duration: 1200 })
  }, [])

  const selectSuggestion = useCallback((produit: Produit) => {
    addToCart(produit)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }, [addToCart])

  // Recherche exacte (barcode / référence)
  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setShowSuggestions(false)
    setSearching(true)
    try {
      const res = await personnelApi.get<{ data: Produit | null }>('/caisse/chercher', { params: { q } })
      const produit = res.data.data
      if (!produit) {
        toast.error(`Produit introuvable : "${q}"`)
      } else {
        addToCart(produit)
      }
    } catch {
      toast.error('Erreur lors de la recherche')
    } finally {
      setSearching(false)
      setQuery('')
      setSuggestions([])
      inputRef.current?.focus()
    }
  }, [addToCart])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        setActiveIdx(-1)
        return
      }
      if (e.key === 'Enter') {
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          selectSuggestion(suggestions[activeIdx])
          return
        }
      }
    }
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query.trim())
    }
  }

  const updateQty = (produitId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => l.produit.id === produitId ? { ...l, quantite: l.quantite + delta } : l)
        .filter((l) => l.quantite > 0),
    )
  }

  const removeLine = (produitId: number) => {
    setCart((prev) => prev.filter((l) => l.produit.id !== produitId))
  }

  const venteMutation = useMutation({
    mutationFn: (payload: VenteRapidePayload) =>
      personnelApi.post<{ data: VenteRapideResult }>('/caisse/vendre', payload).then((r) => r.data.data),
    onSuccess: (result) => {
      setLastVente(result)
      setLastCart([...cart])
      setCart([])
      setPayOpen(false)
      setMontantRecu('')
      setMode('especes')
      toast.success(`Vente ${result.numero} enregistrée`)
      inputRef.current?.focus()
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.errors) {
        const msgs = Object.values(data.errors as Record<string, string[]>).flat().join(' • ')
        toast.error(msgs)
      } else {
        toast.error(data?.message ?? "Erreur lors de l'encaissement")
      }
    },
  })

  const handleEncaisser = () => {
    if (cart.length === 0) return
    const payload: VenteRapidePayload = {
      lignes: cart.map((l) => ({ produit_id: l.produit.id, quantite: l.quantite })),
      mode_paiement: mode,
    }
    if (mode === 'especes' && montantRecu) {
      payload.montant_recu = parseFloat(montantRecu)
    }
    venteMutation.mutate(payload)
  }

  const monnaie = mode === 'especes' && montantRecu
    ? parseFloat(montantRecu) - total
    : null

  return (
    <div>
      <PageHeader title="Caisse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: saisie + panier ───────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Zone saisie */}
          <Card>
            <div className="flex items-start gap-3">
              {/* Input + dropdown */}
              <div className="relative flex-1" ref={wrapRef}>
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-ink-400 shrink-0" />
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Scanner code-barres ou taper le nom du produit…"
                      disabled={searching}
                      className="text-base pr-8"
                      autoFocus
                    />
                    {query.length >= 2 && (
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Dropdown autocomplete */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-ink-200 rounded-[10px] shadow-xl overflow-hidden">
                    {suggestions.map((p, idx) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => { e.preventDefault(); selectSuggestion(p) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-ink-50 last:border-0 ${
                          idx === activeIdx
                            ? 'bg-brand-50 border-brand-100'
                            : 'hover:bg-ink-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{p.designation}</p>
                          <p className="text-xs text-ink-400">
                            {p.reference}
                            {p.code_barre ? ` · ${p.code_barre}` : ''}
                            {' · '}{p.unite}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-ink-900 tabular-nums">
                            {parseFloat(p.prix_vente_ttc as any).toFixed(2)} MAD
                          </p>
                          <p className={`text-[10px] font-medium ${
                            p.stock_actuel <= 0 ? 'text-danger' :
                            p.stock_actuel <= p.stock_minimum ? 'text-warning' : 'text-success'
                          }`}>
                            Stock : {p.stock_actuel} {p.unite}
                          </p>
                        </div>
                      </button>
                    ))}
                    <p className="text-[10px] text-ink-300 text-center py-1.5">
                      ↑↓ naviguer · Entrée sélectionner · Échap fermer
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                loading={searching}
                onClick={() => handleSearch(query.trim())}
                disabled={!query.trim()}
                className="shrink-0"
              >
                Ajouter
              </Button>
            </div>
          </Card>

          {/* Panier */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink-900 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Panier
                {cart.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {cart.length}
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                  Vider
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-ink-400">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Scannez ou recherchez un article</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {cart.map((line) => (
                  <div key={line.produit.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 truncate">{line.produit.designation}</p>
                      <p className="text-xs text-ink-400">{line.produit.reference}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(line.produit.id, -1)}
                        className="w-7 h-7 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 text-ink-600"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-medium tabular-nums">{line.quantite}</span>
                      <button
                        onClick={() => updateQty(line.produit.id, 1)}
                        className="w-7 h-7 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 text-ink-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="w-24 text-right tabular-nums font-medium">
                      {(parseFloat(line.produit.prix_vente_ttc as any) * line.quantite).toFixed(2)} MAD
                    </div>
                    <button
                      onClick={() => removeLine(line.produit.id)}
                      className="text-ink-300 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: total + paiement ─────────────────────── */}
        <div className="space-y-4">
          {lastVente && (
            <Card className="border-success/30 bg-success/5">
              <p className="text-xs text-ink-500 mb-1">Dernière vente</p>
              <p className="font-mono text-sm font-semibold">{lastVente.numero}</p>
              <MoneyDisplay amount={lastVente.montant_ttc} size="lg" color="success" />
              {lastVente.monnaie != null && lastVente.monnaie > 0 && (
                <p className="text-sm mt-1 text-ink-600">
                  Monnaie : <span className="font-semibold">{lastVente.monnaie.toFixed(2)} MAD</span>
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                leftIcon={<Printer className="h-3.5 w-3.5" />}
                onClick={() => printDocument(ticketCaisseHtml({
                  numero: lastVente.numero,
                  lignes: lastCart,
                  total: lastVente.montant_ttc,
                  mode_paiement: mode,
                  montant_recu: montantRecu ? parseFloat(montantRecu) : null,
                  monnaie: lastVente.monnaie,
                }))}
              >
                Imprimer ticket
              </Button>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">Total</h2>
            <div className="text-center py-4">
              <MoneyDisplay amount={total} size="xl" />
            </div>
          </Card>

          {!payOpen ? (
            <Button
              size="lg"
              className="w-full"
              disabled={cart.length === 0}
              onClick={() => setPayOpen(true)}
              leftIcon={<CreditCard className="h-5 w-5" />}
            >
              Encaisser
            </Button>
          ) : (
            <Card>
              <h2 className="font-semibold text-ink-900 mb-3">Mode de paiement</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['especes', 'cheque', 'virement', 'credit'] as PaiementMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      mode === m
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    }`}
                  >
                    {MODE_ICONS[m]}
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>

              {mode === 'especes' && (
                <div className="mb-4">
                  <label className="text-sm text-ink-600 mb-1 block">Montant reçu (MAD)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min={total}
                    value={montantRecu}
                    onChange={(e) => setMontantRecu(e.target.value)}
                    placeholder={total.toFixed(2)}
                    autoFocus
                  />
                  {monnaie !== null && monnaie >= 0 && (
                    <p className="mt-2 text-sm font-semibold text-success">
                      Monnaie à rendre : {monnaie.toFixed(2)} MAD
                    </p>
                  )}
                  {monnaie !== null && monnaie < 0 && (
                    <p className="mt-2 text-sm font-semibold text-danger">
                      Montant insuffisant
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setPayOpen(false); inputRef.current?.focus() }}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  loading={venteMutation.isPending}
                  disabled={mode === 'especes' && monnaie !== null && monnaie < 0}
                  onClick={handleEncaisser}
                  leftIcon={<CreditCard className="h-4 w-4" />}
                >
                  Valider
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
