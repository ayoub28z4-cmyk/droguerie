import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const personnelApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
})

personnelApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_personnel')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

personnelApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('auth_personnel')
      localStorage.removeItem('personnel-auth')
      window.location.href = '/login'
    } else if (status === 403) {
      window.location.href = '/403'
    }
    return Promise.reject(error)
  }
)
