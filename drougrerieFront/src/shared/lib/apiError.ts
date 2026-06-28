/**
 * Extrait un message lisible depuis une erreur Axios / réponse Laravel.
 * Priorité : errors[] (validation 422) > message > fallback générique.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Une erreur est survenue'): string {
  const data = (err as any)?.response?.data
  if (!data) return fallback

  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors as Record<string, string[]>)
      .flat()
      .join(' • ')
    if (messages) return messages
  }

  if (typeof data.message === 'string' && data.message) return data.message

  return fallback
}
