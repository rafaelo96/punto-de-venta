<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-surface-50">
    <!-- Panel Izquierdo: Búsqueda + Categorías + Productos -->
    <div class="flex-1 flex flex-col min-w-0 h-full relative">
      <!-- Header: Buscador y Categorías -->
      <header class="bg-white/95 glass border-b border-surface-200 p-4 lg:p-5 flex-shrink-0 z-10 shadow-sm">
        <div class="flex flex-col gap-3">
          <!-- Buscador + Vista -->
          <div class="flex items-center gap-3">
            <div class="relative group flex-1">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-hover:text-primary-500 transition-colors" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar producto por nombre o código..."
                class="w-full pl-12 pr-4 py-3 bg-white border border-surface-200 rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all hover:border-surface-300 text-sm lg:text-base"
                :style="{ '--tw-ring-color': colorPrincipal }"
                @input="handleSearch"
              />
            </div>
            <!-- Botones de Vista -->
            <div class="flex items-center gap-1 p-1 bg-surface-100 rounded-xl">
              <button
                @click="cambiarVista('cards')"
                class="p-2 rounded-lg transition-all"
                :class="vista === 'cards' ? 'bg-white shadow-md text-white' : 'text-surface-400 hover:text-surface-600 hover:bg-surface-200'"
                :style="vista === 'cards' ? { backgroundColor: colorPrincipal } : {}"
                title="Vista de tarjetas"
              >
                <LayoutGrid class="w-5 h-5" />
              </button>
              <button
                @click="cambiarVista('lista')"
                class="p-2 rounded-lg transition-all"
                :class="vista === 'lista' ? 'bg-white shadow-md text-white' : 'text-surface-400 hover:text-surface-600 hover:bg-surface-200'"
                :style="vista === 'lista' ? { backgroundColor: colorPrincipal } : {}"
                title="Vista de lista"
              >
                <List class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <!-- Categorías en múltiples líneas -->
          <div class="flex flex-wrap gap-2 pt-1 pb-1">
            <button
              @click="categoriaSeleccionada = 'todos'"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
              :class="categoriaSeleccionada === 'todos' ? 'text-white shadow-md scale-105' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'"
              :style="categoriaSeleccionada === 'todos' ? { backgroundColor: colorPrincipal, boxShadow: `0 4px 14px 0 ${colorPrincipal}40` } : {}"
            >
              <LayoutGrid class="w-4 h-4" />
              Todos
            </button>
            <button
              v-for="cat in categorias"
              :key="cat.id"
              @click="categoriaSeleccionada = cat.id"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
              :class="categoriaSeleccionada === cat.id ? 'text-white shadow-md scale-105' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'"
              :style="categoriaSeleccionada === cat.id ? { backgroundColor: colorPrincipal, boxShadow: `0 4px 14px 0 ${colorPrincipal}40` } : {}"
            >
              <Tag class="w-4 h-4" />
              {{ cat.nombre }}
            </button>
          </div>
        </div>
      </header>

      <!-- Grid de Productos -->
      <div class="flex-1 overflow-auto p-4 lg:p-6 bg-gradient-surface">
        <div v-if="loading" class="flex items-center justify-center h-full min-h-0">
          <div class="spinner w-8 h-8" :style="{ borderLeftColor: colorPrincipal }"></div>
        </div>
        
        <div v-else-if="productosFiltrados.length === 0" class="flex flex-col items-center justify-center h-full min-h-0 text-surface-400 animate-fade-in">
          <Package class="w-16 h-16 mb-4 text-surface-300" />
          <p class="text-base font-medium text-surface-600">Sin productos</p>
          <p class="text-sm">No se encontraron productos para esta búsqueda</p>
        </div>

        <!-- Vista de Tarjetas -->
        <div v-else-if="vista === 'cards'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 content-start">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="bg-white p-3 lg:p-4 rounded-2xl border border-surface-100 cursor-pointer shadow-soft hover-lift group animate-fade-in flex flex-col justify-between h-full"
          >
            <div>
              <div class="aspect-square bg-surface-50/50 rounded-xl mb-3 flex items-center justify-center group-hover:bg-primary-50/50 transition-colors overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-tr from-surface-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover rounded-xl" @error="producto.imagen = null" />
                <Package v-else class="w-8 h-8 text-surface-300 group-hover:text-primary-400 transition-colors transform group-hover:scale-110 duration-300" />
              </div>
              <h3 class="font-semibold text-surface-800 text-sm lg:text-base leading-tight mb-2 line-clamp-2" :title="producto.nombre">{{ producto.nombre }}</h3>
            </div>
            <div class="flex items-end justify-between mt-auto">
              <span class="text-base lg:text-lg font-bold" :style="{ color: colorPrincipal }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
              <span v-if="config.mostrar_stock" class="text-xs font-medium text-surface-500 bg-surface-100 px-2 py-1 rounded-md flex items-center gap-1">
                <Archive class="w-3 h-3" /> {{ producto.stock }}
              </span>
            </div>
          </div>
        </div>

        <!-- Vista de Lista -->
        <div v-else-if="vista === 'lista'" class="space-y-2">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="bg-white p-3 rounded-xl border border-surface-100 cursor-pointer shadow-soft hover-lift group animate-fade-in flex items-center gap-4"
          >
            <div class="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
              <Package v-else class="w-6 h-6 text-surface-300" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-surface-800 text-sm truncate">{{ producto.nombre }}</h3>
              <p class="text-xs text-surface-500">{{ producto.categoria_nombre }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="config.mostrar_stock" class="text-xs font-medium text-surface-500 bg-surface-100 px-2 py-1 rounded-md">
                <Archive class="w-3 h-3 inline" /> {{ producto.stock }}
              </span>
              <span class="font-bold" :style="{ color: colorPrincipal }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho: Carrito -->
    <div class="w-full lg:w-[380px] xl:w-[420px] bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.04)] border-t lg:border-t-0 lg:border-l border-surface-100 flex flex-col h-full lg:h-auto z-20" :class="{'lg:max-h-none max-h-[50vh]': true}">
      <div class="p-4 lg:p-5 border-b border-surface-100 flex-shrink-0 bg-white/95 glass sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" :style="{ backgroundColor: colorPrincipal + '15' }">
              <ShoppingCart class="w-5 h-5" :style="{ color: colorPrincipal }" />
            </div>
            <div>
              <h2 class="text-lg lg:text-xl font-bold text-surface-900 leading-tight">Carrito</h2>
              <p class="text-sm text-surface-500 font-medium">{{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button
            v-if="!estaVacio"
            @click="limpiarCarrito"
            class="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors hover:scale-105 active:scale-95"
            title="Limpiar carrito"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-4 lg:p-5">
        <div v-if="estaVacio" class="flex flex-col items-center justify-center h-full text-surface-400 py-12 animate-fade-in">
          <div class="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart class="w-10 h-10 text-surface-300" />
          </div>
          <p class="text-base font-medium text-surface-600">Carrito vacío</p>
          <p class="text-sm text-surface-400 mt-1 text-center">Selecciona productos para <br> agregarlos aquí</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-3 p-3 bg-white border border-surface-100 rounded-2xl hover:border-surface-200 hover:shadow-sm transition-all animate-fade-in group"
          >
            <div class="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center flex-shrink-0">
               <Package class="w-5 h-5 text-surface-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-surface-800 text-sm truncate" :title="item.nombre">
                {{ item.nombre }}
              </h4>
              <p class="text-xs font-medium text-surface-500 mt-0.5">${{ Number(item.precio).toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-2 bg-surface-50 p-1 rounded-xl border border-surface-100">
              <button
                @click="actualizarCantidad(item.id, item.cantidad - 1)"
                class="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
                :style="{ color: colorPrincipal }"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="w-6 text-center font-bold text-sm text-surface-700">{{ item.cantidad }}</span>
              <button
                @click="actualizarCantidad(item.id, item.cantidad + 1)"
                class="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
                :style="{ color: colorPrincipal }"
              >
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <div class="text-right min-w-[70px] flex flex-col items-end gap-1">
              <p class="font-bold text-sm text-surface-900">${{ (Number(item.precio) * item.cantidad).toFixed(2) }}</p>
              <button @click.stop="eliminarDelCarrito(item.id)" class="text-xs font-medium text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <X class="w-3 h-3" /> Quitar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del Carrito -->
      <div v-if="!estaVacio" class="p-4 lg:p-5 border-t border-surface-100 bg-surface-50/50 space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between text-sm font-medium">
            <span class="text-surface-500 flex items-center gap-2">
              <Receipt class="w-4 h-4" />
              Subtotal
            </span>
            <span class="text-surface-900">${{ subtotal.toFixed(2) }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-surface-500 flex items-center gap-2">
              <Percent class="w-4 h-4" />
              Descuento %
            </span>
            <input
              v-model.number="descuentoInput"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              class="w-20 px-3 py-1.5 border border-surface-200 bg-white rounded-xl text-right text-sm font-semibold focus:ring-2 focus:outline-none transition-all"
              :style="{ '--tw-ring-color': colorPrincipal }"
              @change="aplicarDescuento(descuentoInput)"
            />
          </div>
          
          <div v-if="descuentoGlobal > 0" class="flex justify-between text-sm font-medium text-green-600 animate-fade-in">
            <span class="flex items-center gap-2">
              <Tag class="w-4 h-4" />
              Descuento ({{ descuentoGlobal }}%)
            </span>
            <span>-${{ montoDescuento.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="flex justify-between items-end pt-3 border-t border-surface-200">
          <span class="text-base font-bold text-surface-900 flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Total a Cobrar
          </span>
          <span class="text-2xl font-black leading-none" :style="{ color: colorPrincipal }">${{ total.toFixed(2) }}</span>
        </div>

        <!-- Métodos de Pago -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.id"
            @click="metodoPago = metodo.id"
            class="py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 border-2"
            :class="metodoPago === metodo.id ? 'text-white shadow-md scale-[1.02]' : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50'"
            :style="metodoPago === metodo.id ? { backgroundColor: colorPrincipal, borderColor: colorPrincipal, boxShadow: `0 4px 14px 0 ${colorPrincipal}40` } : {}"
          >
            <component :is="metodo.icon" class="w-4 h-4" />
            {{ metodo.nombre }}
          </button>
        </div>

        <button
          @click="finalizarVenta"
          class="w-full py-4 text-white font-bold rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 text-lg shadow-lg hover-lift"
          :style="{ backgroundColor: colorPrincipal, boxShadow: `0 8px 25px -5px ${colorPrincipal}60` }"
        >
          <DollarSign class="w-5 h-5" />
          Cobrar e Imprimir
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Pago -->
    <div v-if="showPagoModal" class="fixed inset-0 bg-surface-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showPagoModal = false">
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-surface-900 flex items-center gap-2">
            <CreditCard class="w-6 h-6" :style="{ color: colorPrincipal }" />
            Cobro de Venta
          </h3>
          <button @click="showPagoModal = false" class="p-2 text-surface-400 hover:bg-surface-100 rounded-xl transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="bg-surface-50 rounded-2xl p-4 border border-surface-100 text-center">
            <p class="text-sm font-medium text-surface-500 mb-1">Total a Cobrar</p>
            <p class="text-4xl font-black" :style="{ color: colorPrincipal }">${{ total.toFixed(2) }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-surface-700 mb-2">Método de Pago</label>
<div class="grid grid-cols-3 gap-2">
    <button 
      v-for="metodo in metodosPago" 
      :key="metodo.id"
      @click="metodoPago = metodo.id; calcularCambio()"
      class="py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border-2"
      :class="metodoPago === metodo.id ? 'text-white shadow-md scale-[1.02]' : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50'"
      :style="metodoPago === metodo.id ? { backgroundColor: colorPrincipal, borderColor: colorPrincipal, boxShadow: `0 4px 14px 0 ${colorPrincipal}40` } : {}"
    >
      <component :is="metodo.icon" class="w-4 h-4" />
      {{ metodo.nombre }}
    </button>
  </div>
            </div>

            <div v-if="metodoPago === 'efectivo'" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-sm font-semibold text-surface-700 mb-2">Efectivo Recibido</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">$</span>
                  <input 
                    v-model.number="efectivoRecibido" 
                    type="number" 
                    step="0.01"
                    @input="calcularCambio"
                    class="w-full pl-8 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-lg font-bold focus:ring-2 focus:outline-none transition-all"
                    :style="{ '--tw-ring-color': colorPrincipal }"
                  />
                </div>
              </div>
              <div class="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex justify-between items-center">
                <span class="text-sm font-semibold text-primary-700">Cambio a entregar:</span>
                <span class="text-xl font-black text-primary-800">${{ cambio.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <button 
            @click="confirmarPago" 
            class="w-full py-4 text-white font-bold rounded-2xl transition-all hover:opacity-90 flex items-center justify-center gap-2 text-lg shadow-lg hover-lift"
            :style="{ backgroundColor: colorPrincipal }"
          >
            <Check class="w-6 h-6" />
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ticket -->

  <div v-if="mostrarTicket" class="fixed inset-0 bg-surface-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="mostrarTicket = false">
    <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl animate-scale-in relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-2" :style="{ backgroundColor: colorPrincipal }"></div>
      
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-3" :style="{ backgroundColor: colorPrincipal + '15' }">
        <Check class="w-8 h-8" :style="{ color: colorPrincipal }" />
      </div>
      <h3 class="text-2xl font-black text-surface-900 mb-2">¡Venta Exitosa!</h3>
      <p class="text-sm font-medium text-surface-500 flex items-center justify-center gap-2 mb-6 bg-surface-50 w-max mx-auto px-3 py-1 rounded-lg">
        <Receipt class="w-4 h-4" />
        Folio: {{ ventaActual?.folio }}
      </p>
      
      <div class="bg-surface-50 rounded-2xl p-5 mb-6 border border-surface-100">
        <p class="text-sm text-surface-500 font-medium mb-1">Monto Cobrado</p>
        <p class="text-4xl font-black text-center mb-4" :style="{ color: colorPrincipal }">${{ ticketData.total.toFixed(2) }}</p>
        
        <div class="space-y-2 pt-4 border-t border-surface-200">
          <div class="flex justify-between text-sm font-medium text-surface-600">
            <span class="flex items-center gap-1.5">
              <Wallet class="w-4 h-4 text-surface-400" />
              Recibido:
            </span>
            <span class="text-surface-900">${{ ticketData.recibido.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold">
            <span class="flex items-center gap-1.5">
              <Coins class="w-4 h-4 text-surface-400" />
              Su Cambio:
            </span>
            <span class="text-surface-900">${{ ticketData.cambio.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <button @click="mostrarTicket = false" class="w-full py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 hover-lift"
        :style="{ backgroundColor: colorPrincipal, boxShadow: `0 4px 14px 0 ${colorPrincipal}40` }"
      >
        <RotateCcw class="w-5 h-5" />
        Siguiente Venta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useVentasStore } from '@/stores/ventas'
import { config, fetchConfig, saveConfig } from '@/stores/config'
import { 
  Search, Package, Tag, LayoutGrid, List, ShoppingCart, Trash2, Plus, Minus, 
  Calculator, DollarSign, CreditCard, Banknote, ScanLine, X, Loader2, Archive,
  ArrowLeftRight, Send
} from 'lucide-vue-next'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

const searchQuery = ref('')
const categoriaSeleccionada = ref('todos')
const vista = ref('cards')
const descuentoInput = ref(0)
const metodoPago = ref('efectivo')
const mostrarTicket = ref(false)
const showPagoModal = ref(false)
const efectivoRecibido = ref(0)
const cambio = ref(0)
const ticketData = ref({ total: 0, recibido: 0, cambio: 0, folio: '' })

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo', icon: Banknote },
  { id: 'tarjeta', nombre: 'Tarjeta', icon: CreditCard },
  { id: 'transferencia', nombre: 'Transferencia', icon: Send }
]

const cambiarVista = async (nuevaVista) => {
  vista.value = nuevaVista
  try {
    await saveConfig({ vista: nuevaVista })
  } catch (e) {
    console.error(e)
  }
}

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
const categorias = computed(() => {
  const cats = productosStore.categorias
  const prods = productosStore.productos
  return cats.filter(c => prods.some(p => p.categoria_id === c.id))
})
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
  if (ventasStore.estaVacio) {
    alert('El carrito está vacío')
    return
  }
  
  efectivoRecibido.value = total.value
  cambio.value = 0
  showPagoModal.value = true
}

const confirmarPago = async () => {
  if (metodoPago.value === 'efectivo' && efectivoRecibido.value < total.value) {
    alert('El monto recibido es menor al total')
    return
  }
  
  const montoTotal = total.value
  const montoRecibido = efectivoRecibido.value
  const montoCambio = cambio.value
  
  const result = await ventasStore.registrarVenta({
    metodo: metodoPago.value,
    efectivo: montoRecibido,
    cambio: montoCambio
  })
  
  if (result.success) {
    showPagoModal.value = false
    
    ticketData.value = { 
      total: montoTotal, 
      recibido: montoRecibido, 
      cambio: montoCambio, 
      folio: result.venta.folio 
    }
    
    mostrarTicket.value = true
    ventaActual.value = result.venta
    
    productosStore.fetchProductos()
  } else {
    alert('Error al registrar venta: ' + result.error)
  }
}

const calcularCambio = () => {
  if (metodoPago.value === 'efectivo') {
    cambio.value = Math.max(0, efectivoRecibido.value - total.value)
  } else {
    cambio.value = 0
  }
}

onMounted(async () => {
  await fetchConfig()
  await nextTick()
  console.log('Config vista:', config.vista)
  vista.value = config.vista || 'cards'
  console.log('Vista set to:', vista.value)
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