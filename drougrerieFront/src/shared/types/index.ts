// ── Pagination ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

// ── Auth ───────────────────────────────────────────────────
export interface Personnel {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  actif: boolean
  roles: string[]
  created_at: string
  updated_at: string
}

export interface PersonnelAuthResponse {
  token: string
  personnel: Personnel
  permissions: string[]
}

export interface Client {
  id: number
  nom: string
  prenom?: string
  raison_sociale?: string
  type_client: 'particulier' | 'professionnel' | 'entreprise'
  telephone: string
  email?: string
  adresse?: string
  ville?: string
  ice?: string
  credit_limite: number
  solde_du: number
  credit_disponible: number
  actif: boolean
  created_at: string
  updated_at: string
}

export interface ClientAuthResponse {
  token: string
  client: Client
}

// ── Produit ────────────────────────────────────────────────
export interface ProduitImage {
  id: number
  thumbnail: string
  medium: string
  original: string
}

export interface Produit {
  id: number
  reference: string
  code_barre?: string
  designation: string
  description?: string
  categorie_id: number
  categorie?: Categorie
  prix_achat: number
  prix_vente_ht: number
  tva: number
  prix_vente_ttc: number
  unite: string
  stock_actuel: number
  stock_minimum: number
  stock_maximum: number
  statut: 'actif' | 'rupture' | 'archive'
  actif: boolean
  images: ProduitImage[]
  created_at: string
  updated_at: string
}

// ── Catégorie ──────────────────────────────────────────────
export interface Categorie {
  id: number
  nom: string
  description?: string
  couleur?: string
  icone?: string
  actif: boolean
  produits_count?: number
  created_at: string
  updated_at: string
}

// ── Fournisseur ────────────────────────────────────────────
export interface Fournisseur {
  id: number
  nom: string
  telephone?: string
  email?: string
  adresse?: string
  ville?: string
  ice?: string
  solde_du: number
  actif: boolean
  created_at: string
  updated_at: string
}

// ── Commande ───────────────────────────────────────────────
export type CommandeStatut =
  | 'en_attente'
  | 'confirmee'
  | 'en_preparation'
  | 'en_livraison'
  | 'livree'
  | 'cloturee'
  | 'annulee'

export type CommandeCanal = 'magasin' | 'portail'

export interface CommandeLigne {
  id: number
  produit_id: number
  produit?: Produit
  quantite: number
  prix_unitaire_ht: number
  tva: number
  montant_ht: number
  montant_ttc: number
}

export interface Commande {
  id: number
  numero: string
  client_id: number
  client?: Client
  canal: CommandeCanal
  statut: CommandeStatut
  date_livraison?: string
  notes?: string
  montant_ht: number
  tva: number
  montant_ttc: number
  montant_paye: number
  reste_a_payer: number
  lignes: CommandeLigne[]
  paiements?: Paiement[]
  personnel?: Personnel
  created_at: string
  updated_at: string
}

export interface CreateCommandePayload {
  client_id: number
  canal: CommandeCanal
  date_livraison?: string
  notes?: string
  lignes: {
    produit_id: number
    quantite: number
    prix_unitaire_ht: number
  }[]
}

// ── Paiement ───────────────────────────────────────────────
export type PaiementMode = 'especes' | 'cheque' | 'virement' | 'credit'
export type PaiementStatut = 'en_attente' | 'valide' | 'rejete' | 'rembourse'

export interface Paiement {
  id: number
  commande_id: number
  commande?: Commande
  montant: number
  mode_paiement: PaiementMode
  statut: PaiementStatut
  reference?: string
  notes?: string
  personnel?: Personnel
  validated_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePaiementPayload {
  commande_id: number
  montant: number
  mode_paiement: PaiementMode
  reference?: string
  notes?: string
}

// ── Stock ──────────────────────────────────────────────────
export type MouvementType = 'entree' | 'sortie' | 'retour' | 'ajustement' | 'inventaire'

export interface MouvementStock {
  id: number
  produit_id: number
  produit?: Produit
  type_mouvement: MouvementType
  quantite: number
  stock_avant: number
  stock_apres: number
  motif?: string
  personnel?: Personnel
  source?: string
  created_at: string
}

export interface AlerteStock {
  produit_id: number
  produit: Produit
  stock_actuel: number
  stock_minimum: number
  type: 'rupture' | 'critique' | 'faible'
}

export interface AjustementStockPayload {
  produit_id: number
  type_mouvement: MouvementType
  quantite: number
  motif: string
}

// ── Approvisionnement ──────────────────────────────────────
export type ApproStatut = 'brouillon' | 'commande' | 'en_transit' | 'receptionne' | 'valide'

export interface ApproLigne {
  id: number
  produit_id: number
  produit?: Produit
  quantite_commandee: number
  quantite_recue?: number
  prix_achat_unitaire: number
  total_ht: number
}

export interface Approvisionnement {
  id: number
  numero_bl?: string
  fournisseur_id: number
  fournisseur?: Fournisseur
  statut: ApproStatut
  statut_label?: string
  date_reception?: string
  notes?: string
  montant_total: number
  lignes: ApproLigne[]
  personnel?: Personnel
  created_at: string
  updated_at: string
}

// ── Inventaire ─────────────────────────────────────────────
export type InventaireStatut = 'brouillon' | 'valide'

export interface InventaireLigne {
  id: number
  produit_id: number
  produit?: Produit
  stock_theorique: number
  stock_reel: number
  ecart: number
  motif_ecart?: string
}

export interface Inventaire {
  id: number
  statut: InventaireStatut
  date_inventaire: string
  notes?: string
  lignes: InventaireLigne[]
  personnel?: Personnel
  validated_at?: string
  created_at: string
  updated_at: string
}

// ── Rapports ───────────────────────────────────────────────
export interface TableauDeBord {
  ca_mois: number
  ca_mois_precedent: number
  nb_commandes_en_cours: number
  nb_alertes_stock: number
  nb_clients_actifs: number
  nb_commandes_aujourd_hui: number
  chiffre_affaires_semaine: { date: string; total: number }[]
  top_produits: { produit: Produit; total_vendu: number; ca: number }[]
  repartition_statuts: { statut: CommandeStatut; count: number }[]
}

export interface RapportCA {
  nb_commandes: number
  total_ht: number
  total_tva: number
  total_ttc: number
  total_encaisse: number
  total_restant: number
  par_periode: { periode: string; total_ttc: number; nb_commandes: number }[]
}

export interface TopProduit {
  produit: Produit
  quantite_vendue: number
  ca_ht: number
  ca_ttc: number
}

// ── Audit Log ──────────────────────────────────────────────
export interface AuditLog {
  id: number
  action: string
  description: string
  model_type: string | null
  model_id: number | null
  created_at: string
  personnel: {
    id: number
    nom: string
    roles: string[]
  } | null
}

// ── Filters (shared) ───────────────────────────────────────
export interface CommandeFilters {
  statut?: CommandeStatut
  canal?: CommandeCanal
  client_id?: number
  search?: string
  page?: number
  per_page?: number
}

export interface ProduitFilters {
  categorie_id?: number
  statut?: string
  search?: string
  page?: number
  per_page?: number
}
