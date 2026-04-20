import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('pos_token'),
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token
        this.user = data.user
        localStorage.setItem('pos_token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
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
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
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
      
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.user
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('pos_token')
      delete api.defaults.headers.common['Authorization']
    }
  }
})