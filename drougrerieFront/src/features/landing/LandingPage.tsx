import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HardHat, Users, BarChart3, Package, ShoppingCart,
  ArrowRight, Layers, Zap, Shield
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-900 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-brand-500 flex items-center justify-center shadow-brand">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Droguerie BTP Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/portail/login')}
            className="text-sm text-ink-300 hover:text-white transition-colors"
          >
            Espace client
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium px-4 py-2 rounded-[10px] border border-ink-700 hover:border-ink-500 hover:bg-ink-800 transition-all"
          >
            Connexion
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Background blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-600/6 rounded-full blur-[80px] pointer-events-none" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Gestion professionnelle BTP au Maroc
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
          >
            Matériaux de{' '}
            <span className="relative inline-block">
              <span className="text-brand-400">qualité</span>
            </span>
            ,<br />livrés avec{' '}
            <span className="text-accent-400">précision</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-ink-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10"
          >
            Ciment, carrelage, peinture, électricité — commandez en ligne
            et suivez vos livraisons en temps réel.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/portail/login')}
              className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-[12px] bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base shadow-brand transition-colors"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              Commander maintenant
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/portail/catalogue')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-[12px] border border-ink-700 hover:border-ink-500 hover:bg-ink-800 text-ink-200 font-medium text-base transition-all"
            >
              <Package className="h-4.5 w-4.5" />
              Voir le catalogue
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-ink-600 uppercase tracking-widest">Découvrir</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-ink-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-ink-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Portails ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Votre accès dédié</h2>
          <p className="text-ink-400">Deux espaces, chacun conçu pour ses besoins.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Client card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6 }}
            onClick={() => navigate('/portail/login')}
            className="group relative cursor-pointer rounded-[20px] bg-gradient-to-br from-brand-600 to-brand-700 p-8 overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-white/15 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Espace Client</h3>
              <p className="text-brand-200 text-sm leading-relaxed mb-8">
                Consultez le catalogue, passez vos commandes en ligne et suivez leur avancement en temps réel.
              </p>
              <ul className="space-y-2 mb-8">
                {['Catalogue complet avec prix TTC', 'Commandes en quelques clics', 'Suivi de livraison'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-brand-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                Accéder à mon espace
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>

          {/* Employee card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6 }}
            onClick={() => navigate('/login')}
            className="group relative cursor-pointer rounded-[20px] bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700/60 p-8 overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-500/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-500/5 rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-ink-700 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-accent-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Espace Personnel</h3>
              <p className="text-ink-400 text-sm leading-relaxed mb-8">
                Gérez le stock, validez les commandes, suivez les paiements et consultez les rapports.
              </p>
              <ul className="space-y-2 mb-8">
                {['Tableau de bord temps réel', 'Gestion stock & approvisionnements', 'Rapports et analyses'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-ink-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-ink-200 font-semibold text-sm group-hover:gap-3 transition-all">
                Connexion personnel
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Zap className="h-5 w-5 text-brand-400" />, title: 'Commandes rapides', desc: 'Sélectionnez vos produits, validez en quelques secondes.' },
            { icon: <Layers className="h-5 w-5 text-accent-400" />, title: 'Stock en temps réel', desc: 'Disponibilité mise à jour instantanément après chaque mouvement.' },
            { icon: <Shield className="h-5 w-5 text-success" />, title: 'Données sécurisées', desc: 'Chaque transaction respecte le principe ACID — aucune perte de donnée.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-[16px] border border-ink-800 bg-ink-900/60 p-6"
            >
              <div className="w-10 h-10 rounded-[10px] bg-ink-800 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h4 className="font-display font-semibold text-white mb-1.5">{f.title}</h4>
              <p className="text-ink-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-brand-500 flex items-center justify-center">
              <HardHat className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-semibold text-sm text-ink-300">Droguerie BTP Pro</span>
          </div>
          <p className="text-ink-600 text-xs">© 2026 — Tous droits réservés</p>
          <div className="flex items-center gap-4 text-xs text-ink-600">
            <button onClick={() => navigate('/portail/login')} className="hover:text-ink-400 transition-colors">Espace client</button>
            <span>·</span>
            <button onClick={() => navigate('/login')} className="hover:text-ink-400 transition-colors">Personnel</button>
          </div>
        </div>
      </footer>

    </div>
  )
}
