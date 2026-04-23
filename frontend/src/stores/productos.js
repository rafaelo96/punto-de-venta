import { defineStore } from 'pinia'
import axios from 'axios'

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

export const useProductosStore = defineStore('productos', {
  state: () => ({
    productos: [],
    categorias: [],
    loading: false,
    error: null,
    searchQuery: '',
    categoriaSeleccionada: 'todos'
  }),

  getters: {
    productosFiltrados: (state) => {
      let filtrados = state.productos
      
      if (state.categoriaSeleccionada !== 'todos') {
        filtrados = filtrados.filter(p => p.categoria_id === state.categoriaSeleccionada)
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtrados = filtrados.filter(p => 
          p.nombre.toLowerCase().includes(query) ||
          p.codigo_barras?.toLowerCase().includes(query)
        )
      }
      
      return filtrados
    },
    
    productosPorCategoria: (state) => {
      const agrupados = {}
      state.productos.forEach(p => {
        const cat = p.categoria_nombre || 'Sin categoría'
        if (!agrupados[cat]) agrupados[cat] = []
        agrupados[cat].push(p)
      })
      return agrupados
    },
    
    totalProductos: (state) => state.productos.length,
    
    stockBajo: (state) => state.productos.filter(p => p.stock <= p.stock_minimo)
  },

  actions: {
    async fetchProductos() {
      this.loading = true
      try {
        const { data } = await api.get('/productos')
        this.productos = data
      } catch (error) {
        this.error = error.response?.data?.message
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategorias() {
      try {
        const { data } = await api.get('/categorias')
        this.categorias = data
      } catch (error) {
        this.error = error.response?.data?.message
      }
    },
    
    async crearProducto(productoData) {
      this.loading = true
      try {
        const { data } = await api.post('/productos', productoData)
        this.productos.push(data)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message 
        }
      } finally {
        this.loading = false
      }
    },
    
    async actualizarProducto(id, productoData) {
      this.loading = true
      try {
        const { data } = await api.put(`/productos/${id}`, productoData)
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) this.productos[index] = data
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message 
        }
      } finally {
        this.loading = false
      }
    },
    
    async eliminarProducto(id) {
      try {
        await api.delete(`/productos/${id}`)
        this.productos = this.productos.filter(p => p.id !== id)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message 
        }
      }
    },
    
    setSearchQuery(query) {
      this.searchQuery = query
    },
    
    setCategoria(categoriaId) {
      this.categoriaSeleccionada = categoriaId
    },
    
    async ajustarStock(id, cantidad, tipo) {
      try {
        const { data } = await api.patch(`/productos/${id}/stock`, { cantidad, tipo })
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) this.productos[index] = data
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message 
        }
      }
    }
  }
})