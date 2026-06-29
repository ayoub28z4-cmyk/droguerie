import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { FormField, Input } from '@/shared/ui/FormField'
import { authApi } from './authApi'
import { isAxiosError } from 'axios'

const schema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().optional(),
  telephone: z.string().min(1, 'Le téléphone est obligatoire'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string().min(1, 'Confirmez le mot de passe'),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  ice: z.string().optional(),
  type_client: z.enum(['particulier', 'professionnel', 'entreprise']),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

export function ClientRegisterPage() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_client: 'particulier' },
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await authApi.clientRegister(data)
      setSuccess(true)
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 422) {
          const errs = err.response?.data?.errors ?? {}
          Object.entries(errs).forEach(([field, messages]) => {
            setError(field as keyof FormData, { message: (messages as string[])[0] })
          })
          return
        }
      }
      setServerError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-100 via-bg to-accent-100/30 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-ink-200/60 p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-2">Demande envoyée !</h2>
          <p className="text-sm text-ink-500 mb-6">
            Votre inscription a été enregistrée. L'administrateur va examiner votre demande et activer votre compte.
            Vous recevrez une confirmation dès la validation.
          </p>
          <Button variant="outline" onClick={() => navigate('/portail/login')} className="w-full">
            Retour à la connexion
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-100 via-bg to-accent-100/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-surface rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-ink-200/60 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] gradient-brand flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-ink-900">Droguerie BTP</p>
            <p className="text-xs text-ink-500">Créer un compte client</p>
          </div>
        </div>

        <h1 className="font-display text-xl font-bold text-ink-900 mb-1">Inscription</h1>
        <p className="text-sm text-ink-500 mb-6">
          Remplissez ce formulaire. L'accès sera activé après validation par notre équipe.
        </p>

        {serverError && (
          <div className="mb-4 p-3 rounded-[var(--radius)] bg-danger-bg border border-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type client */}
          <FormField label="Type de compte" error={errors.type_client?.message} required>
            <select
              {...register('type_client')}
              className="w-full h-9 rounded-[var(--radius)] border border-ink-200 bg-surface px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="particulier">Particulier</option>
              <option value="professionnel">Professionnel</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom" error={errors.nom?.message} required>
              <Input placeholder="Dupont" error={!!errors.nom} {...register('nom')} />
            </FormField>
            <FormField label="Prénom" error={errors.prenom?.message}>
              <Input placeholder="Jean" error={!!errors.prenom} {...register('prenom')} />
            </FormField>
          </div>

          <FormField label="Téléphone" error={errors.telephone?.message} required>
            <Input type="tel" placeholder="06 12 34 56 78" error={!!errors.telephone} {...register('telephone')} />
          </FormField>

          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="vous@example.com" error={!!errors.email} {...register('email')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mot de passe" error={errors.password?.message} required>
              <Input type="password" placeholder="••••••••" error={!!errors.password} {...register('password')} />
            </FormField>
            <FormField label="Confirmer" error={errors.password_confirmation?.message} required>
              <Input type="password" placeholder="••••••••" error={!!errors.password_confirmation} {...register('password_confirmation')} />
            </FormField>
          </div>

          <FormField label="Adresse" error={errors.adresse?.message}>
            <Input placeholder="12 rue des Artisans" error={!!errors.adresse} {...register('adresse')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ville" error={errors.ville?.message}>
              <Input placeholder="Casablanca" error={!!errors.ville} {...register('ville')} />
            </FormField>
            <FormField label="ICE (entreprise)" error={errors.ice?.message}>
              <Input placeholder="000000000000000" error={!!errors.ice} {...register('ice')} />
            </FormField>
          </div>

          <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
            Envoyer ma demande
          </Button>
        </form>

        <p className="text-center text-xs text-ink-400 mt-6">
          Déjà un compte ?{' '}
          <a href="/portail/login" className="text-brand-600 hover:underline font-medium">Se connecter →</a>
        </p>
      </motion.div>
    </div>
  )
}
