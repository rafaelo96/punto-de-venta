import axios from 'axios'
import { useToast } from '@/composables/useToast'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        localStorage.removeItem('pos_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (status === 429) {
        const toast = useToast()
        toast.warning('Demasiadas solicitudes. Espera un momento.')
        return Promise.reject(error)
      }

      if (status >= 500) {
        const toast = useToast()
        toast.error('Error del servidor. Intenta más tarde.')
        return Promise.reject(error)
      }
    } else if (error.request) {
      const toast = useToast()
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }

    return Promise.reject(error)
  }
)

export default api