<template>
  <div class="h-full flex">
    <div class="flex-1 flex flex-col">
      <header class="bg-white border-b border-surface-200 px-6 py-4">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              class="w-full max-w-md pl-11 pr-4 py-3 bg-surface-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              @input="handleSearch"
            />
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="categoriaSeleccionada = 'todos'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              :class="categoriaSeleccionada === 'todos' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
            >
              Todos
            </button>
            <button
              v-for="cat in categorias"
              :key="cat.id"
              @click="categoriaSeleccionada = cat.id"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              :class="categoriaSeleccionada === cat.id ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
            >
              {{ cat.nombre }}
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-6">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
        
        <div v-else-if="productosFiltrados.length === 0" class="flex flex-col items-center justify-center h-full text-surface-400">
          <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4m0-10l-8-4"/>
          </svg>
          <p class="text-lg">No hay productos</p>
          <p class="text-sm">Agrega productos desde la sección de Productos</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="bg-white p-4 rounded-2xl border border-surface-100 cursor-pointer hover:border-primary-300 hover:shadow-lg transition-all group"
          >
            <div class="aspect-square bg-surface-50 rounded-xl mb-3 flex items-center justify-center">
              <span class="text-4xl text-surface-200">📦</span>
            </div>
            <h3 class="font-semibold text-surface-900 truncate mb-1">{{ producto.nombre }}</h3>
            <p class="text-xs text-surface-500 truncate mb-2">{{ producto.codigo_barras }}</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-primary-600">${{ Number(producto.precio_venta).toFixed(2) }}</span>
              <span class="text-xs text-surface-400">Stock: {{ producto.stock }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-96 bg-white border-l border-surface-200 flex flex-col">
      <div class="p-5 border-b border-surface-100">
        <h2 class="text-lg font-bold text-surface-900">Carrito de Venta</h2>
        <p class="text-sm text-surface-500">{{ totalItems }} artículos</p>
      </div>

      <div class="flex-1 overflow-auto p-5">
        <div v-if="estaVacio" class="flex flex-col items-center justify-center h-full text-surface-400">
          <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p>Carrito vacío</p>
          <p class="text-sm">Agrega productos del catálogo</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex gap-3 p-3 bg-surface-50 rounded-xl"
          >
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-surface-900 truncate">{{ item.nombre }}</h4>
              <p class="text-sm text-surface-500">${{ Number(item.precio).toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="actualizarCantidad(item.id, item.cantidad - 1)"
                class="w-8 h-8 bg-white border border-surface-200 rounded-lg flex items-center justify-center hover:bg-surface-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <span class="w-10 text-center font-semibold">{{ item.cantidad }}</span>
              <button
                @click="actualizarCantidad(item.id, item.cantidad + 1)"
                class="w-8 h-8 bg-white border border-surface-200 rounded-lg flex items-center justify-center hover:bg-surface-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            <div class="text-right">
              <p class="font-semibold text-surface-900">${{ (Number(item.precio) * item.cantidad).toFixed(2) }}</p>
              <button @click.stop="eliminarDelCarrito(item.id)" class="text-xs text-red-500 hover:text-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!estaVacio" class="p-5 border-t border-surface-100 space-y-3">
        <div class="flex justify-between text-surface-600">
          <span>Subtotal</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-sm text-surface-600">Descuento:</span>
          <input
            v-model.number="descuentoInput"
            type="number"
            min="0"
            max="100"
            placeholder="0%"
            class="w-20 px-3 py-2 border border-surface-200 rounded-lg text-center"
            @change="aplicarDescuento(descuentoInput)"
          />
          <span class="text-sm text-surface-500">%</span>
        </div>
        
        <div v-if="descuentoGlobal > 0" class="flex justify-between text-green-600">
          <span>Descuento ({{ descuentoGlobal }}%)</span>
          <span>-${{ montoDescuento.toFixed(2) }}</span>
        </div>
        
        <div class="flex justify-between text-xl font-bold text-surface-900 pt-3 border-t border-surface-100">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.id"
            @click="metodoPago = metodo.id"
            class="py-3 border-2 rounded-xl text-center font-medium transition-colors"
            :class="metodoPago === metodo.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-surface-200 text-surface-600 hover:border-surface-300'"
          >
            {{ metodo.nombre }}
          </button>
        </div>

        <button
          @click="finalizarVenta"
          class="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white text-lg font-bold rounded-xl transition-colors"
        >
          Cobrar
        </button>

        <button
          @click="limpiarCarrito"
          class="w-full py-3 border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50"
        >
          Limpiar Carrito
        </button>
      </div>
    </div>
  </div>

  <div v-if="mostrarTicket" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="mostrarTicket = false">
    <div class="bg-white rounded-2xl p-8 w-full max-w-md text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-surface-900 mb-2">Venta Registrada</h3>
      <p class="text-surface-500 mb-4">Folio: {{ ventaActual?.folio }}</p>
      
      <div class="text-left bg-surface-50 rounded-xl p-4 mb-6">
        <p class="text-3xl font-bold text-center mb-4">${{ total.toFixed(2) }}</p>
        <div class="flex justify-between">
          <span>Recibido:</span>
          <span>${{ efectivoRecibido.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold">
          <span>Cambio:</span>
          <span>${{ cambio.toFixed(2) }}</span>
        </div>
      </div>

      <button @click="mostrarTicket = false" class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl">
        Nueva Venta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useVentasStore } from '@/stores/ventas'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

const searchQuery = ref('')
const categoriaSeleccionada = ref('todos')
const descuentoInput = ref(0)
const metodoPago = ref('efectivo')
const mostrarTicket = ref(false)
const efectivoRecibido = ref(0)
const cambio = ref(0)

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'tarjeta', nombre: 'Tarjeta' },
  { id: 'transferencia', nombre: 'Transferencia' }
]

const productosFiltrados = computed(() => {
  let filtrados = productosStore.productos.filter(p => p.stock > 0)
  
  if (categoriaSeleccionada.value !== 'todos') {
    filtrados = filtrados.filter(p => p.categoria_id === categoriaSeleccionada.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtrados = filtrados.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.codigo_barras?.toLowerCase().includes(q)
    )
  }
  
  return filtrados
})

const loading = computed(() => productosStore.loading)
const categorias = computed(() => productosStore.categorias)
const items = computed(() => ventasStore.items)
const estaVacio = computed(() => ventasStore.estaVacio)
const totalItems = computed(() => ventasStore.totalItems)
const subtotal = computed(() => ventasStore.subtotal)
const descuentoGlobal = computed(() => ventasStore.descuentoGlobal)
const montoDescuento = computed(() => ventasStore.montoDescuento)
const total = computed(() => ventasStore.total)
const ventaActual = computed(() => ventasStore.ventaActual)

const handleSearch = () => {
  productosStore.setSearchQuery(searchQuery.value)
}

const agregarAlCarrito = (producto) => {
  ventasStore.agregarProducto(producto)
}

const actualizarCantidad = (productoId, cantidad) => {
  ventasStore.actualizarCantidad(productoId, cantidad)
}

const eliminarDelCarrito = (productoId) => {
  ventasStore.eliminarProducto(productoId)
}

const aplicarDescuento = (porcentaje) => {
  ventasStore.aplicarDescuento(porcentaje)
}

const finalizarVenta = async () => {
  if (metodoPago.value === 'efectivo') {
    efectivoRecibido.value = total.value
    cambio.value = 0
  }
  
  const result = await ventasStore.registrarVenta({
    metodo: metodoPago.value,
    efectivo: efectivoRecibido.value,
    cambio: cambio.value
  })
  
  if (result.success) {
    mostrarTicket.value = true
    productosStore.fetchProductos()
  }
}

const limpiarCarrito = () => {
  ventasStore.limpiarCarrito()
  descuentoInput.value = 0
}

onMounted(() => {
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
})
</script>