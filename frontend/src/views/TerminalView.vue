<template>
  <div class="h-full flex flex-col lg:flex-row">
    <!-- Panel Izquierdo: Búsqueda + Categorías + Productos -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header: Buscador y Categorías -->
      <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 p-3 lg:p-4">
        <div class="flex flex-col gap-3">
          <!-- Buscador -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar producto..."
              class="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': colorPrincipal }"
              @input="handleSearch"
            />
          </div>
          
          <!-- Categorías scrollable -->
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              @click="categoriaSeleccionada = 'todos'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
              :class="categoriaSeleccionada === 'todos' ? 'text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
              :style="categoriaSeleccionada === 'todos' ? { backgroundColor: colorPrincipal } : {}"
            >
              <LayoutGrid class="w-4 h-4" />
              Todos
            </button>
            <button
              v-for="cat in categorias"
              :key="cat.id"
              @click="categoriaSeleccionada = cat.id"
              class="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
              :class="categoriaSeleccionada === cat.id ? 'text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
              :style="categoriaSeleccionada === cat.id ? { backgroundColor: colorPrincipal } : {}"
            >
              <Tag class="w-4 h-4" />
              {{ cat.nombre }}
            </button>
          </div>
        </div>
      </header>

      <!-- Grid de Productos -->
      <div class="flex-1 overflow-auto p-3 lg:p-4">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <Loader2 class="w-8 h-8 animate-spin" :style="{ color: colorPrincipal }" />
        </div>
        
        <div v-else-if="productosFiltrados.length === 0" class="flex flex-col items-center justify-center h-full text-surface-400">
          <Package class="w-12 h-12 mb-3" />
          <p class="text-sm font-medium">Sin productos</p>
          <p class="text-xs">Agrega productos en la sección de Productos</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 lg:gap-3">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="bg-white p-2 lg:p-3 rounded-xl border border-surface-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div class="aspect-square bg-surface-50 rounded-lg mb-2 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
              <Package class="w-6 h-6 text-surface-300 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 class="font-medium text-surface-900 text-xs lg:text-sm truncate mb-1">{{ producto.nombre }}</h3>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold" :style="{ color: colorPrincipal }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
              <span v-if="config.mostrar_stock" class="text-xs text-surface-400 flex items-center gap-1">
                <Archive class="w-3 h-3" /> {{ producto.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho: Carrito -->
    <div class="w-full lg:w-80 xl:w-96 bg-white/80 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-surface-200 flex flex-col" style="max-height: 50vh lg:max-height: none;">
      <div class="p-3 lg:p-4 border-b border-surface-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
              <ShoppingCart class="w-4 h-4" :style="{ color: colorPrincipal }" />
            </div>
            <div>
              <h2 class="text-base lg:text-lg font-bold text-surface-900">Carrito</h2>
              <p class="text-xs lg:text-sm text-surface-500">{{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button
            v-if="!estaVacio"
            @click="limpiarCarrito"
            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Limpiar carrito"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-3 lg:p-4">
        <div v-if="estaVacio" class="flex flex-col items-center justify-center h-full text-surface-400 py-8">
          <ShoppingCart class="w-12 h-12 mb-2" />
          <p class="text-sm">Carrito vacío</p>
          <p class="text-xs">Agrega productos del catálogo</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-2 p-2 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-surface-900 text-sm truncate flex items-center gap-2">
                <Package class="w-4 h-4 text-surface-400" />
                {{ item.nombre }}
              </h4>
              <p class="text-xs text-surface-500">${{ Number(item.precio).toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="actualizarCantidad(item.id, item.cantidad - 1)"
                class="w-7 h-7 border rounded-lg flex items-center justify-center transition-colors"
                :style="{ borderColor: colorPrincipal, color: colorPrincipal }"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="w-6 text-center font-semibold text-sm">{{ item.cantidad }}</span>
              <button
                @click="actualizarCantidad(item.id, item.cantidad + 1)"
                class="w-7 h-7 border rounded-lg flex items-center justify-center transition-colors"
                :style="{ borderColor: colorPrincipal, color: colorPrincipal }"
              >
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <div class="text-right min-w-[60px]">
              <p class="font-semibold text-sm">${{ (Number(item.precio) * item.cantidad).toFixed(2) }}</p>
              <button @click.stop="eliminarDelCarrito(item.id)" class="text-xs text-red-500 hover:text-red-600 transition-colors">
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del Carrito -->
      <div v-if="!estaVacio" class="p-3 lg:p-4 border-t border-surface-100 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-surface-600 flex items-center gap-2">
            <Receipt class="w-4 h-4" />
            Subtotal
          </span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <Percent class="w-4 h-4 text-surface-400" />
          <input
            v-model.number="descuentoInput"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            class="w-16 px-2 py-1.5 border border-surface-200 rounded-lg text-center text-sm"
            @change="aplicarDescuento(descuentoInput)"
          />
          <span class="text-sm text-surface-500">% dto.</span>
        </div>
        
        <div v-if="descuentoGlobal > 0" class="flex justify-between text-sm text-green-600">
          <span class="flex items-center gap-2">
            <Tag class="w-4 h-4" />
            Descuento ({{ descuentoGlobal }}%)
          </span>
          <span>-${{ montoDescuento.toFixed(2) }}</span>
        </div>
        
        <div class="flex justify-between text-lg font-bold pt-2 border-t border-surface-100">
          <span class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Total
          </span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <!-- Métodos de Pago -->
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.id"
            @click="metodoPago = metodo.id"
            class="py-2 border-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
            :class="metodoPago === metodo.id ? 'text-white' : 'border-surface-200 text-surface-600'"
            :style="metodoPago === metodo.id ? { backgroundColor: colorPrincipal, borderColor: colorPrincipal } : {}"
          >
            <component :is="metodo.icon" class="w-3 h-3" />
            {{ metodo.nombre }}
          </button>
        </div>

        <button
          @click="finalizarVenta"
          class="w-full py-3 text-white font-bold rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
          :style="{ backgroundColor: colorPrincipal }"
        >
          <DollarSign class="w-4 h-4" />
          Cobrar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Ticket -->
  <div v-if="mostrarTicket" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="mostrarTicket = false">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
      <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" :style="{ backgroundColor: colorPrincipal + '20' }">
        <Check class="w-7 h-7" :style="{ color: colorPrincipal }" />
      </div>
      <h3 class="text-xl font-bold text-surface-900 mb-1">¡Venta Registrada!</h3>
      <p class="text-sm text-surface-500 flex items-center justify-center gap-2">
        <Receipt class="w-4 h-4" />
        {{ ventaActual?.folio }}
      </p>
      
      <div class="bg-surface-50 rounded-xl p-4 mb-4 mt-4">
        <p class="text-3xl font-bold text-center mb-3" :style="{ color: colorPrincipal }">${{ total.toFixed(2) }}</p>
        <div class="flex justify-between text-sm">
          <span class="flex items-center gap-1">
            <Wallet class="w-4 h-4" />
            Recibido:
          </span>
          <span>${{ efectivoRecibido.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold mt-1">
          <span class="flex items-center gap-1">
            <Coins class="w-4 h-4" />
            Cambio:
          </span>
          <span>${{ cambio.toFixed(2) }}</span>
        </div>
      </div>

      <button @click="mostrarTicket = false" class="w-full py-3 text-white font-bold rounded-lg transition-colors hover:opacity-90 flex items-center justify-center gap-2"
        :style="{ backgroundColor: colorPrincipal }"
      >
        <RotateCcw class="w-4 h-4" />
        Nueva Venta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useVentasStore } from '@/stores/ventas'
import { config, fetchConfig } from '@/stores/config'
import { 
  Search, LayoutGrid, Tag, Package, Archive, ShoppingCart, Trash2, 
  Minus, Plus, X, Receipt, Percent, CreditCard, DollarSign, Check,
  Wallet, Coins, RotateCcw, Banknote, CreditCard as CardIcon, Send
} from 'lucide-vue-next'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

const searchQuery = ref('')
const categoriaSeleccionada = ref('todos')
const descuentoInput = ref(0)
const metodoPago = ref('efectivo')
const mostrarTicket = ref(false)
const efectivoRecibido = ref(0)
const cambio = ref(0)

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo', icon: Banknote },
  { id: 'tarjeta', nombre: 'Tarjeta', icon: CardIcon },
  { id: 'transferencia', nombre: 'Transferencia', icon: Send }
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
  if (config.sonido) {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodHLn3E+OyNtWnRvcbqmeUgxLih1oNzFqnRKNShh4NfMmWonYyYvRdyzam9jKC4uaujLp3xQPkE3i7+1bWIiIiIzjre1a2ElJSUntLJxYSsrLCSxr3FsIiMjIi2xr3FtISUlJbKxbWIoKSopsK5wYSYmJiuvr3BiJiYlLbCvbyUnJiSusG9fISEhIK2vr28iIiAuu7txISEhIK2vr28iIiAusK9vISEhIK2wr28iISAtrq9vISEgLbCvb28iISAtra9vISEgLq6vbyIiIC2tr28iISMqrq9vICIjKK6ub2IiIiqtrW8iIiIqraxuYiIiKqutbGIiIiqqrG1iISMqq6xsYSISKqqsbWIiIiqqq2sbWIiIiqrrG1iIiKqq6xtYiIiqausbWIB')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }
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
    if (config.emitir_ticket) {
      mostrarTicket.value = true
    }
    productosStore.fetchProductos()
  }
}

const limpiarCarrito = () => {
  ventasStore.limpiarCarrito()
  descuentoInput.value = 0
}

onMounted(() => {
  fetchConfig()
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>