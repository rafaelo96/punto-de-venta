import { defineStore } from 'pinia'
import api from '@/api'

export const useVentasStore = defineStore('ventas', {
  state: () => ({
    items: [],
    metodoPago: 'efectivo',
    descuentoGlobal: 0,
    loading: false,
    historial: [],
    ventaActual: null
  }),

  getters: {
    subtotal: (state) => {
      return state.items.reduce((sum, item) => {
        const precioUnitario = item.precio * (1 - (item.descuento || 0) / 100)
        return sum + (precioUnitario * item.cantidad)
      }, 0)
    },

    montoDescuentoGlobal: (state) => {
      const sub = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      return sub * (state.descuentoGlobal / 100)
    },

    total: (state) => {
      const sub = state.items.reduce((sum, item) => {
        const precioUnitario = item.precio * (1 - (item.descuento || 0) / 100)
        return sum + (precioUnitario * item.cantidad)
      }, 0)
      const descuento = sub * (state.descuentoGlobal / 100)
      return Math.max(0, sub - descuento)
    },

    totalItems: (state) => {
      return state.items.reduce((sum, item) => sum + item.cantidad, 0)
    },

    estaVacio: (state) => state.items.length === 0
  },

  actions: {
    agregarProducto(producto, cantidad = 1) {
      const existente = this.items.find(item => item.id === producto.id)

      if (existente) {
        existente.cantidad += cantidad
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          precio: producto.precio_venta,
          precioOriginal: producto.precio_venta,
          cantidad: cantidad,
          stock: producto.stock,
          imagen: producto.imagen || null,
          descuento: 0
        })
      }
    },

    actualizarCantidad(productoId, cantidad) {
      const item = this.items.find(item => item.id === productoId)
      if (item) {
        if (cantidad <= 0) {
          this.eliminarProducto(productoId)
        } else {
          item.cantidad = cantidad
        }
      }
    },

    eliminarProducto(productoId) {
      this.items = this.items.filter(item => item.id !== productoId)
    },

    aplicarDescuento(porcentaje) {
      this.descuentoGlobal = Math.max(0, Math.min(100, porcentaje || 0))
    },

    setMetodoPago(metodo) {
      this.metodoPago = metodo
    },

    async registrarVenta(datosPago) {
      this.loading = true
      try {
        const itemsParaEnviar = datosPago.items ? datosPago.items : this.items.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio * (1 - (item.descuento || 0) / 100),
          descuento: item.descuento || 0
        }))

        const ventaData = {
          items: itemsParaEnviar,
          metodo_pago: datosPago.metodo || this.metodoPago,
          descuento_porcentaje: this.descuentoGlobal,
          total: this.total,
          efectivo: datosPago.efectivo || 0,
          cambio: datosPago.cambio || 0
        }

        const { data } = await api.post('/ventas', ventaData)
        this.ventaActual = data
        this.limpiarCarrito()
        return { success: true, venta: data }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al registrar venta'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchHistorial() {
      try {
        const { data } = await api.get('/ventas/historial')
        this.historial = data
      } catch (error) {
        console.error(error)
      }
    },

    async cancelarVenta(ventaId, motivo) {
      this.loading = true
      try {
        const { data } = await api.post(`/ventas/cancelar/${ventaId}`, { motivo })
        return { success: true, data }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al cancelar venta'
        }
      } finally {
        this.loading = false
      }
    },

    limpiarCarrito() {
      this.items = []
      this.descuentoGlobal = 0
      this.metodoPago = 'efectivo'
    }
  }
})