import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { FormField, Input } from '@/shared/ui/FormField'
import { authApi } from './authApi'
import { useClientAuth } from './clientAuthStore'
import { isAxiosError } from 'axios'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type FormData = z.infer<typeof schema>

export function ClientLoginPage() {
  const navigate = useNavigate()
  const setAuth = useClientAuth((s) => s.setAuth)
  const [rateLimited, setRateLimited] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError('')
    setRateLimited(false)
    try {
      const res = await authApi.clientLogin(email, password)
      const { token, client } = res.data
      setAuth(token, client)
      navigate('/portail/commandes', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 429) { setRateLimited(true); return }
        if (status === 422) {
          const errs = err.response?.data?.errors ?? {}
          Object.entries(errs).forEach(([field, messages]) => {
            setError(field as keyof FormData, { message: (messages as string[])[0] })
          })
          return
        }
        if (status === 401) { setServerError('Email ou mot de passe incorrect.'); return }
      }
      setServerError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-100 via-bg to-accent-100/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-surface rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-ink-200/60 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] gradient-brand flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-ink-900">Droguerie BTP</p>
            <p className="text-xs text-ink-500">Espace client</p>
          </div>
        </div>

        <h1 className="font-display text-xl font-bold text-ink-900 mb-1">Connexion</h1>
        <p className="text-sm text-ink-500 mb-6">Accédez à vos commandes et catalogue</p>

        {rateLimited && (
          <div className="mb-4 p-3 rounded-[var(--radius)] bg-warning-bg border border-amber-200 flex items-start gap-2">
            <Clock className="h-4 w-4 text-warning mt-0.5" />
            <p className="text-sm text-amber-700">Trop de tentatives. Réessayez dans une minute.</p>
          </div>
        )}
        {serverError && (
          <div className="mb-4 p-3 rounded-[var(--radius)] bg-danger-bg border border-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="vous@example.com" error={!!errors.email} {...register('email')} />
          </FormField>
          <FormField label="Mot de passe" error={errors.password?.message} required>
            <Input type="password" placeholder="••••••••" error={!!errors.password} {...register('password')} />
          </FormField>
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            Se connecter
          </Button>
        </form>

        <p className="text-center text-xs text-ink-400 mt-6">
          Accès personnel ?{' '}
          <a href="/login" className="text-brand-600 hover:underline font-medium">Espace personnel →</a>
        </p>
      </motion.div>
    </div>
  )
}
