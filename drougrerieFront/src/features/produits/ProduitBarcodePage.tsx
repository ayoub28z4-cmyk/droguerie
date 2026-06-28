import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Barcode from 'react-barcode'
import { ArrowLeft, Printer } from 'lucide-react'
import { produitsApi } from './produitsApi'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function ProduitBarcodePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const { data: produit, isLoading } = useQuery({
    queryKey: ['produits', Number(id)],
    queryFn: () => produitsApi.get(Number(id)).then((r) => r.data.data),
    enabled: !!id,
  })

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=400,height=300')
    if (!win) return
    win.document.write(`
      <html><head><title>Code-barres — ${produit?.designation}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
        .label { text-align: center; padding: 12px; }
        .ref { font-size: 11px; color: #666; margin-top: 4px; }
        .name { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-ink-100 rounded-[var(--radius)]" />
  }

  return (
    <div>
      <PageHeader
        title="Code-barres"
        description={produit?.designation}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/produits/${id}`)}>
              Retour au produit
            </Button>
            <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint} disabled={!produit?.code_barre}>
              Imprimer
            </Button>
          </div>
        }
      />

      <div className="max-w-md mx-auto mt-6">
        <Card>
          {produit?.code_barre ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div ref={printRef} className="label text-center">
                <p className="name text-sm font-semibold text-ink-900 mb-2">{produit.designation}</p>
                <Barcode
                  value={produit.code_barre}
                  format="CODE128"
                  width={2}
                  height={80}
                  displayValue
                  fontSize={13}
                  margin={10}
                />
                <p className="ref text-xs text-ink-500 mt-1">{produit.reference}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-ink-500 text-sm">Aucun code-barres renseigné pour ce produit.</p>
              <Button variant="outline" onClick={() => navigate(`/produits/${id}`)}>
                Ajouter un code-barres
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
