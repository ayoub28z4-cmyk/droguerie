import type { Commande, Produit } from '@/shared/types'

export interface CartLine {
  produit: Produit
  quantite: number
}

// ── Configurer les infos de votre société ici ──────────────────────────────
const COMPANY = {
  nom:      'Droguerie BTP',
  adresse:  'Votre adresse, Ville',
  telephone:'Votre téléphone',
  email:    'contact@droguerie.ma',
  ice:      '000000000000000',
  if_num:   '00000000',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number | string | null | undefined): string {
  const v = parseFloat(String(n ?? 0))
  return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
}

function fmtDate(s?: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function clientName(c: Commande['client']): string {
  if (!c) return 'Client comptoir'
  return c.raison_sociale ?? `${c.prenom ?? ''} ${c.nom}`.trim()
}

// ── CSS commun (paramétrique selon le format) ──────────────────────────────
export type PrintFormat = 'A4' | 'A5'

function buildCss(format: PrintFormat): string {
  const a5 = format === 'A5'
  return `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: ${format} portrait; margin: 0; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: ${a5 ? '10px' : '12px'};
    color: #111; background: #fff;
    padding: ${a5 ? '10mm 13mm' : '18mm 20mm'};
  }
  .header {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding-bottom: ${a5 ? '10px' : '14px'}; border-bottom: 3px solid #1e3a8a;
    margin-bottom: ${a5 ? '12px' : '18px'};
  }
  .company-name { font-size: ${a5 ? '17px' : '22px'}; font-weight: 700; color: #1e3a8a; margin-bottom: 3px; }
  .company-info { font-size: ${a5 ? '9px' : '11px'}; color: #555; line-height: 1.6; }
  .doc-title { font-size: ${a5 ? '21px' : '28px'}; font-weight: 800; letter-spacing: 2px; text-align: right; }
  .doc-meta { font-size: ${a5 ? '9px' : '11px'}; color: #555; text-align: right; margin-top: 5px; line-height: 1.6; }
  .parties {
    display: flex; justify-content: space-between;
    margin-bottom: ${a5 ? '12px' : '18px'}; gap: ${a5 ? '10px' : '16px'};
  }
  .party-box { border: 1px solid #e2e8f0; border-radius: 5px; padding: ${a5 ? '8px' : '12px'}; flex: 1; }
  .party-title { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .party-name { font-size: ${a5 ? '11px' : '14px'}; font-weight: 700; color: #111; }
  .party-info { font-size: ${a5 ? '9px' : '11px'}; color: #555; margin-top: 2px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin: ${a5 ? '10px' : '14px'} 0; }
  thead th {
    background: #1e3a8a; color: #fff;
    padding: ${a5 ? '5px 6px' : '8px 10px'};
    text-align: left; font-size: ${a5 ? '9px' : '11px'}; font-weight: 600;
  }
  .right { text-align: right; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td {
    padding: ${a5 ? '4px 6px' : '7px 10px'};
    font-size: ${a5 ? '9.5px' : '11.5px'};
    border-bottom: 1px solid #f1f5f9; vertical-align: top;
  }
  .section-title {
    font-size: ${a5 ? '10px' : '12px'}; font-weight: 700; color: #374151;
    margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0;
  }
  .footer {
    margin-top: ${a5 ? '16px' : '28px'}; padding-top: 8px;
    border-top: 1px solid #e2e8f0; font-size: 9px; color: #9ca3af; text-align: center;
  }
  @media print { button { display: none !important; } }
  `
}

// ── FACTURE ────────────────────────────────────────────────────────────────
export function factureHtml(commande: Commande, format: PrintFormat = 'A4'): string {
  const lignes    = commande.lignes ?? []
  const paiements = commande.paiements ?? []
  const client    = commande.client

  const lignesRows = lignes.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${l.produit?.designation ?? `Produit #${l.produit_id}`}</strong>
        ${l.produit?.reference ? `<br><span style="font-size:10px;color:#9ca3af">${l.produit.reference}</span>` : ''}
      </td>
      <td class="right">${l.quantite}</td>
      <td>${l.produit?.unite ?? 'u.'}</td>
      <td class="right">${fmt(l.prix_unitaire_ht)}</td>
      <td class="right">${l.tva} %</td>
      <td class="right">${fmt(l.montant_ht)}</td>
      <td class="right"><strong>${fmt(l.montant_ttc)}</strong></td>
    </tr>
  `).join('')

  const paiementsHtml = paiements.length > 0 ? `
    <div style="margin-top:20px">
      <p class="section-title">Historique des paiements</p>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Mode</th><th>Référence</th><th class="right">Montant</th><th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${paiements.map(p => `
            <tr>
              <td>${fmtDate(p.created_at)}</td>
              <td style="text-transform:capitalize">${p.mode_paiement}</td>
              <td>${p.reference ?? '—'}</td>
              <td class="right"><strong>${fmt(p.montant)} MAD</strong></td>
              <td><span style="color:${p.statut === 'valide' ? '#166534' : '#92400e'};font-weight:600;font-size:10px">${p.statut}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${commande.numero}</title>
  <style>
    ${buildCss(format)}
    .doc-title { color: #1e3a8a; }
    .totals-wrap { display: flex; justify-content: flex-end; margin-top: 6px; }
    .totals-box { width: ${format === 'A5' ? '220px' : '300px'}; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: ${format === 'A5' ? '4px 10px' : '6px 14px'}; font-size: ${format === 'A5' ? '10px' : '12px'}; border-bottom: 1px solid #f1f5f9; }
    .totals-row:last-child { border-bottom: none; }
    .totals-grand { background: #1e3a8a; color: #fff; font-size: ${format === 'A5' ? '13px' : '15px'}; font-weight: 700; padding: ${format === 'A5' ? '7px 10px' : '10px 14px'}; display: flex; justify-content: space-between; }
    .totals-paye { background: #f0fdf4; color: #166534; font-weight: 600; }
    .totals-reste { background: #fef2f2; color: #dc2626; font-weight: 700; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${COMPANY.nom}</div>
      <div class="company-info">
        ${COMPANY.adresse}<br>
        Tél : ${COMPANY.telephone} &nbsp;|&nbsp; ${COMPANY.email}<br>
        ICE : ${COMPANY.ice} &nbsp;|&nbsp; IF : ${COMPANY.if_num}
      </div>
    </div>
    <div>
      <div class="doc-title">FACTURE</div>
      <div class="doc-meta">
        N° <strong>${commande.numero}</strong><br>
        Date d'émission : ${fmtDate(commande.created_at)}<br>
        ${commande.date_livraison ? `Date de livraison : ${fmtDate(commande.date_livraison)}<br>` : ''}
        Statut : <strong>${commande.statut.replace('_', ' ')}</strong>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-title">Vendeur</div>
      <div class="party-name">${COMPANY.nom}</div>
      <div class="party-info">${COMPANY.adresse}<br>Tél : ${COMPANY.telephone}</div>
    </div>
    <div class="party-box">
      <div class="party-title">Client</div>
      <div class="party-name">${clientName(client)}</div>
      <div class="party-info">
        ${client?.telephone ? `Tél : ${client.telephone}<br>` : ''}
        ${client?.email && client.email !== 'comptoir@droguerie.local' ? `Email : ${client.email}<br>` : ''}
        ${client?.ice ? `ICE : ${client.ice}<br>` : ''}
        ${client?.adresse ? `${client.adresse}${client.ville ? ', ' + client.ville : ''}` : ''}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Désignation</th>
        <th class="right" style="width:50px">Qté</th>
        <th style="width:50px">Unité</th>
        <th class="right" style="width:90px">P.U. HT</th>
        <th class="right" style="width:55px">TVA</th>
        <th class="right" style="width:90px">Total HT</th>
        <th class="right" style="width:95px">Total TTC</th>
      </tr>
    </thead>
    <tbody>${lignesRows}</tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="totals-row"><span>Sous-total HT</span><span>${fmt(commande.montant_ht)} MAD</span></div>
      <div class="totals-row"><span>TVA</span><span>${fmt(commande.tva)} MAD</span></div>
      <div class="totals-grand"><span>Total TTC</span><span>${fmt(commande.montant_ttc)} MAD</span></div>
      <div class="totals-row totals-paye"><span>Montant payé</span><span>${fmt(commande.montant_paye)} MAD</span></div>
      ${parseFloat(String(commande.reste_a_payer)) > 0 ? `<div class="totals-row totals-reste"><span>Reste à payer</span><span>${fmt(commande.reste_a_payer)} MAD</span></div>` : ''}
    </div>
  </div>

  ${paiementsHtml}

  ${commande.notes ? `<div style="margin-top:18px"><p class="section-title">Notes</p><p style="font-size:11px;color:#555;padding:8px 12px;background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:0 4px 4px 0">${commande.notes}</p></div>` : ''}

  <div class="footer">
    Document généré le ${new Date().toLocaleDateString('fr-MA')} &nbsp;—&nbsp; ${COMPANY.nom} &nbsp;—&nbsp; ${COMPANY.adresse}
  </div>
</body>
</html>`
}

// ── BON DE LIVRAISON ───────────────────────────────────────────────────────
export function bonLivraisonHtml(commande: Commande, format: PrintFormat = 'A4'): string {
  const lignes = commande.lignes ?? []
  const client = commande.client

  const lignesRows = lignes.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${l.produit?.designation ?? `Produit #${l.produit_id}`}</strong>
        ${l.produit?.reference ? `<br><span style="font-size:10px;color:#9ca3af">${l.produit.reference}</span>` : ''}
      </td>
      <td class="right" style="font-size:15px;font-weight:700">${l.quantite}</td>
      <td>${l.produit?.unite ?? 'u.'}</td>
      <td style="color:#9ca3af;font-size:10px">☐ Conforme &nbsp;&nbsp; ☐ Non-conforme</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de livraison ${commande.numero}</title>
  <style>
    ${buildCss(format)}
    .doc-title { color: #065f46; }
    .sign-section { display: flex; justify-content: space-between; margin-top: ${format === 'A5' ? '24px' : '40px'}; gap: ${format === 'A5' ? '14px' : '24px'}; }
    .sign-box { flex: 1; }
    .sign-label { font-size: ${format === 'A5' ? '9px' : '11px'}; font-weight: 700; color: #374151; margin-bottom: 3px; }
    .sign-area { border: 1px solid #d1d5db; border-radius: 5px; height: ${format === 'A5' ? '50px' : '70px'}; margin-top: 3px; }
    .sign-note { font-size: 9px; color: #9ca3af; margin-top: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${COMPANY.nom}</div>
      <div class="company-info">
        ${COMPANY.adresse}<br>
        Tél : ${COMPANY.telephone}<br>
        ICE : ${COMPANY.ice}
      </div>
    </div>
    <div>
      <div class="doc-title">BON DE LIVRAISON</div>
      <div class="doc-meta">
        N° <strong>${commande.numero}</strong><br>
        Date : ${fmtDate(commande.created_at)}<br>
        ${commande.date_livraison ? `Livraison prévue : <strong>${fmtDate(commande.date_livraison)}</strong>` : ''}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-title">Expéditeur</div>
      <div class="party-name">${COMPANY.nom}</div>
      <div class="party-info">${COMPANY.adresse}<br>Tél : ${COMPANY.telephone}</div>
    </div>
    <div class="party-box">
      <div class="party-title">Destinataire</div>
      <div class="party-name">${clientName(client)}</div>
      <div class="party-info">
        ${client?.telephone ? `Tél : ${client.telephone}<br>` : ''}
        ${client?.adresse ? `${client.adresse}${client.ville ? ', ' + client.ville : ''}` : ''}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Désignation</th>
        <th class="right" style="width:70px">Quantité</th>
        <th style="width:60px">Unité</th>
        <th style="width:200px">Contrôle réception</th>
      </tr>
    </thead>
    <tbody>${lignesRows}</tbody>
  </table>

  ${commande.notes ? `<div style="margin-top:15px"><p class="section-title">Notes / Instructions de livraison</p><p style="font-size:11px;color:#555;padding:8px 12px;background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 4px 4px 0">${commande.notes}</p></div>` : ''}

  <div class="sign-section">
    <div class="sign-box">
      <div class="sign-label">Préparé et expédié par :</div>
      <div class="sign-area"></div>
      <div class="sign-note">Nom, date et signature</div>
    </div>
    <div class="sign-box">
      <div class="sign-label">Reçu et vérifié par le client :</div>
      <div class="sign-area"></div>
      <div class="sign-note">Nom, date et signature &nbsp;|&nbsp; Date de réception : ___/___/_______</div>
    </div>
  </div>

  <div class="footer">
    Bon de livraison généré le ${new Date().toLocaleDateString('fr-MA')} &nbsp;—&nbsp; ${COMPANY.nom}
    &nbsp;|&nbsp; Ce document ne constitue pas une facture.
  </div>
</body>
</html>`
}

// ── TICKET CAISSE ──────────────────────────────────────────────────────────
export interface TicketData {
  numero: string
  lignes: CartLine[]
  total: number
  mode_paiement: string
  montant_recu?: number | null
  monnaie?: number | null
}

export function ticketCaisseHtml(data: TicketData): string {
  const modLabels: Record<string, string> = {
    especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', credit: 'Crédit',
  }

  const lignesRows = data.lignes.map(l => `
    <tr>
      <td>${l.produit.designation}</td>
      <td style="text-align:center">${l.quantite}</td>
      <td style="text-align:right">${fmt(parseFloat(String(l.produit.prix_vente_ttc)) * l.quantite)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ticket ${data.numero}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; font-size: 12px; color: #111; background: #fff; width: 80mm; margin: 0 auto; padding: 8mm 5mm; }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    .company { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
    .divider { border: none; border-top: 1px dashed #555; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 10px; color: #555; text-align: left; padding: 3px 0; border-bottom: 1px dashed #ccc; }
    th:nth-child(2), th:nth-child(3) { text-align: center; }
    td { padding: 4px 0; font-size: 11.5px; vertical-align: top; }
    td:last-child { text-align: right; white-space: nowrap; }
    td:nth-child(2) { text-align: center; width: 30px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .grand-total { font-size: 16px; font-weight: 700; border-top: 2px solid #111; padding-top: 6px; margin-top: 4px; }
    .merci { font-size: 12px; font-weight: 700; text-align: center; margin-top: 12px; }
    @media print { body { width: 80mm; } }
  </style>
</head>
<body>
  <div class="center">
    <div class="company">${COMPANY.nom}</div>
    <div style="font-size:10px;color:#555">${COMPANY.adresse}</div>
    <div style="font-size:10px;color:#555">Tél : ${COMPANY.telephone}</div>
  </div>

  <hr class="divider">

  <div style="font-size:10px;color:#555;margin-bottom:4px">
    N° <strong>${data.numero}</strong><br>
    Le ${new Date().toLocaleDateString('fr-MA')} à ${new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
  </div>

  <hr class="divider">

  <table>
    <thead>
      <tr><th>Article</th><th>Qté</th><th style="text-align:right">Montant</th></tr>
    </thead>
    <tbody>${lignesRows}</tbody>
  </table>

  <hr class="divider">

  <div class="total-row"><span>Total TTC</span><span></span></div>
  <div class="total-row grand-total"><span>TOTAL</span><span>${fmt(data.total)} MAD</span></div>

  <hr class="divider">

  <div class="total-row"><span>Mode</span><span>${modLabels[data.mode_paiement] ?? data.mode_paiement}</span></div>
  ${data.montant_recu ? `<div class="total-row"><span>Reçu</span><span>${fmt(data.montant_recu)} MAD</span></div>` : ''}
  ${data.monnaie != null && data.monnaie > 0 ? `<div class="total-row bold"><span>Monnaie</span><span>${fmt(data.monnaie)} MAD</span></div>` : ''}

  <hr class="divider">

  <div class="merci">Merci de votre visite !</div>
  <div class="center" style="font-size:9px;color:#9ca3af;margin-top:6px">ICE : ${COMPANY.ice}</div>
</body>
</html>`
}
