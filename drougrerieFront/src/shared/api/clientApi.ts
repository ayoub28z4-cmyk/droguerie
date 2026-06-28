import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

const clientTokenInterceptor = (config: import('axios').InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_client')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

const clientUnauthorizedInterceptor = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    localStorage.removeItem('auth_client')
    window.location.href = '/portail/login'
  }
  return Promise.reject(error)
}

// Routes portail (/api/portail/*)
export const clientApi = axios.create({
  baseURL: `${BASE_URL}/portail`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
})
clientApi.interceptors.request.use(clientTokenInterceptor)
clientApi.interceptors.response.use((res) => res, clientUnauthorizedInterceptor)

// Routes auth client (/api/client/auth/*)
export const clientAuthApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
})
clientAuthApi.interceptors.request.use(clientTokenInterceptor)
clientAuthApi.interceptors.response.use((res) => res, clientUnauthorizedInterceptor)
