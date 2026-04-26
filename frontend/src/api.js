import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  console.log('[API Request] Token from localStorage:', token ? 'Present' : 'Absent')
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
    if (error.response?.status === 401) {
      console.error('[API Response] 401 Unauthorized - Token missing or invalid')
    }
    return Promise.reject(error)
  }
)

export default api