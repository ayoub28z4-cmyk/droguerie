import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HardHat, AlertTriangle, Clock, ArrowLeft, Mail, Lock } from 'lucide-react'
import { authApi } from './authApi'
import { usePersonnelAuth } from './personnelAuthStore'
import { isAxiosError } from 'axios'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = usePersonnelAuth((s) => s.setAuth)
  const [rateLimited, setRateLimited] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError('')
    setRateLimited(false)
    try {
      const res = await authApi.personnelLogin(email, password)
      const { token, personnel, permissions } = res.data
      setAuth(token, personnel, permissions)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 429) { setRateLimited(true); return }
        if (status === 422) {
          const errs = err.response?.data?.errors ?? {}
          Object.entries(errs).forEach(([field, messages]) =>
            setError(field as keyof FormData, { message: (messages as string[])[0] })
          )
          return
        }
        if (status === 401) { setServerError('Email ou mot de passe incorrect.'); return }
      }
      setServerError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-500/6 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-ink-500 hover:text-ink-300 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </button>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-[24px] border border-ink-700/60 bg-ink-800/70 backdrop-blur-xl p-8 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-[18px] bg-brand-500 flex items-center justify-center shadow-brand mb-4">
              <HardHat className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Espace Personnel</h1>
            <p className="text-ink-400 text-sm mt-1">Droguerie BTP Pro</p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {rateLimited && (
              <motion.div
                key="rate"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-[12px] bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Trop de tentatives</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">Attendez 1 minute puis réessayez.</p>
                  </div>
                </div>
              </motion.div>
            )}
            {serverError && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-[12px] bg-red-500/10 border border-red-500/20 flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{serverError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-300 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="vous@droguerie.ma"
                  {...register('email')}
                  className={`w-full h-11 pl-10 pr-4 rounded-[12px] bg-ink-900/60 border text-white text-sm placeholder:text-ink-600 outline-none transition-all
                    focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60
                    ${errors.email ? 'border-red-500/50' : 'border-ink-700 hover:border-ink-600'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-300 uppercase tracking-wide">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-11 pl-10 pr-4 rounded-[12px] bg-ink-900/60 border text-white text-sm placeholder:text-ink-600 outline-none transition-all
                    focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60
                    ${errors.password ? 'border-red-500/50' : 'border-ink-700 hover:border-ink-600'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              className="w-full h-11 mt-2 rounded-[12px] bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm shadow-brand transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : 'Se connecter'}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-ink-600 mt-5">
          Vous êtes client ?{' '}
          <button
            onClick={() => navigate('/portail/login')}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Accès portail client →
          </button>
        </p>
      </motion.div>
    </div>
  )
}
