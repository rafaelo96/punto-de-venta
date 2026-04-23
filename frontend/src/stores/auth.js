import { defineStore } from 'pinia'
import axios from 'axios'
import { applyThemeColor } from './config'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('pos_token'),
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    negocio: (state) => state.user?.negocio || null
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token
        this.user = data.user
        localStorage.setItem('pos_token', data.token)
        
        if (data.user.negocio?.color_principal) {
          applyThemeColor(data.user.negocio.color_principal)
        }
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al iniciar sesión' 
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/register', userData)
        this.token = data.token
        this.user = data.user
        localStorage.setItem('pos_token', data.token)
        
        if (data.user.negocio?.color_principal) {
          applyThemeColor(data.user.negocio.color_principal)
        }
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al registrar' 
        }
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      if (!this.token) return
      
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.user
        
        if (data.user?.negocio?.color_principal) {
          applyThemeColor(data.user.negocio.color_principal)
        }
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('pos_token')
      localStorage.removeItem('color_principal')
    }
  }
})