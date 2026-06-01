<template>
  <div class="h-full flex flex-col bg-[rgb(var(--surface-50))] transition-colors duration-300">
    <header class="px-8 py-6 glass border-b border-[rgb(var(--neutral-200))] transition-colors duration-300">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
          <History class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-[rgb(var(--neutral-900))] tracking-tight">Historial de Ventas</h1>
          <p class="text-sm text-[rgb(var(--neutral-500))]">Buscar y reimprimir tickets</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Buscador -->
        <div class="section-container">
          <div class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-semibold mb-2 text-[rgb(var(--neutral-700))]">Buscar</label>
              <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--neutral-400))]" />
                <input
                  v-model="busqueda"
                  type="text"
                  placeholder="Buscar por ID, cliente o fecha..."
                  class="w-full pl-12 pr-4 py-3 rounded-xl border bg-[rgb(var(--surface-100))] border-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-900))] placeholder-[rgb(var(--neutral-400))]"
                  @input="buscar"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-[rgb(var(--neutral-700))]">Desde</label>
              <input
                type="date"
                v-model="fechaInicio"
                class="px-4 py-3 rounded-xl border bg-[rgb(var(--surface-100))] border-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-900))]"
                @change="buscar"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-[rgb(var(--neutral-700))]">Hasta</label>
              <input
                type="date"
                v-model="fechaFin"
                class="px-4 py-3 rounded-xl border bg-[rgb(var(--surface-100))] border-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-900))]"
                @change="buscar"
              />
            </div>
          </div>
        </div>

        <!-- Lista de Ventas -->
        <div class="section-container">
          <div v-if="cargando" class="text-center py-8">
            <div class="animate-spin w-8 h-8 rounded-full border-2 border-transparent mx-auto" :style="{ borderTopColor: 'rgb(var(--color-primary))' }"></div>
          </div>
          
          <div v-else-if="ventas.length === 0" class="text-center py-12">
            <Receipt class="w-16 h-16 mx-auto mb-4 text-[rgb(var(--neutral-300))]" />
            <p class="text-[rgb(var(--neutral-500))]">No hay ventas registradas</p>
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="venta in ventas" 
              :key="venta.id" 
              class="flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer hover-lift bg-neutral-50/80 hover:bg-neutral-100/80"
              @click="seleccionarVenta(venta)"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
                  <Receipt class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="font-semibold text-[rgb(var(--neutral-900))]">#{{ venta.id }}</p>
                  <p class="text-sm text-[rgb(var(--neutral-500))]">{{ formatFecha(venta.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="font-bold" :style="{ color: venta.status === 'cancelada' ? '#ef4444' : 'rgb(var(--color-primary))' }">${{ formatNumber(venta.total) }}</p>
                  <span v-if="venta.status === 'cancelada'" class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">CANCELADA</span>
                  <p v-else class="text-xs uppercase text-[rgb(var(--neutral-500))]">{{ venta.metodo_pago }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button @click.stop="reimprimir(venta)" class="p-2 rounded-xl hover:bg-[rgb(var(--neutral-200))] transition-colors bg-white">
                    <Printer class="w-5 h-5" style="color: rgb(var(--color-primary));"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
<!-- Paginación -->
           <div v-if="ventas.length > 0" class="flex justify-center items-center gap-4 mt-8">
             <button 
               @click="paginaAnterior" 
               :disabled="pagina === 1"
               class="p-3 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-md hover:scale-105"
               :class="[pagina === 1 ? 'opacity-50' : 'bg-white text-[rgb(var(--color-primary))] border border-neutral-200']"
             >
               <ChevronLeft class="w-5 h-5" />
             </button>
<span class="px-4 py-2 rounded-xl bg-neutral-50 text-[rgb(var(--color-primary))] font-medium">
  Página {{ pagina }} de {{ totalPaginas }}
</span>
             <button 
               @click="paginaSiguiente" 
               :disabled="ventas.length < 50"
               class="p-3 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-md hover:scale-105"
               :class="[ventas.length < 50 ? 'opacity-50' : 'bg-white text-[rgb(var(--color-primary))] border border-neutral-200']"
             >
               <ChevronRight class="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle -->
    <div v-if="ventaSeleccionada" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="ventaSeleccionada = null">
      <div class="bg-[rgb(var(--surface-100))] rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto border border-[rgb(var(--neutral-200))]">
        <div class="p-6 border-b border-[rgb(var(--neutral-200))]">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-[rgb(var(--neutral-900))]">Ticket #{{ ventaSeleccionada.id }}</h2>
            <button @click="ventaSeleccionada = null" class="p-2 rounded-xl hover:bg-[rgb(var(--neutral-200))]">
              <X class="w-5 h-5 text-[rgb(var(--neutral-600))]" />
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex justify-between text-sm">
            <span class="text-[rgb(var(--neutral-500))]">Fecha</span>
            <span class="text-[rgb(var(--neutral-900))]">{{ formatFecha(ventaSeleccionada.created_at) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-[rgb(var(--neutral-500))]">Usuario</span>
            <span class="text-[rgb(var(--neutral-900))]">{{ ventaSeleccionada.usuario_nombre }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-[rgb(var(--neutral-500))]">Método de pago</span>
            <span class="uppercase text-[rgb(var(--neutral-900))]">{{ ventaSeleccionada.metodo_pago }}</span>
          </div>
          <div v-if="ventaSeleccionada.status === 'cancelada'" class="flex justify-between text-sm">
            <span class="text-[rgb(var(--neutral-500))]">Estado</span>
            <span class="font-bold text-red-500">CANCELADA</span>
          </div>
          
          <hr class="border-[rgb(var(--neutral-200))]" />
          
          <div class="space-y-2">
            <h3 class="font-semibold mb-2 text-[rgb(var(--neutral-900))]">Productos</h3>
            <div v-for="item in itemsVenta" :key="item.id" class="flex justify-between text-sm">
              <span class="text-[rgb(var(--neutral-700))]">
                {{ item.cantidad }}x {{ item.producto_nombre }}
              </span>
              <span class="text-[rgb(var(--neutral-900))]">${{ formatNumber(item.precio_unitario * item.cantidad) }}</span>
            </div>
          </div>
          
          <hr class="border-[rgb(var(--neutral-200))]" />
          
          <div class="flex justify-between text-lg font-bold">
            <span class="text-[rgb(var(--neutral-900))]">Total</span>
            <span :style="{ color: 'rgb(var(--color-primary))' }">${{ formatNumber(ventaSeleccionada.total) }}</span>
          </div>
          
           <div class="flex gap-2 pt-4">
              <button @click="reimprimir(ventaSeleccionada)" class="btn flex-1 flex items-center justify-center gap-2"
                style="background-color: rgb(var(--color-primary)); color: white;">
                <Printer class="w-5 h-5" />
                Reimprimir
              </button>
              <button v-if="ventaSeleccionada.status !== 'cancelada'" @click="showCancelModal = true"
                class="btn flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white">
                <X class="w-5 h-5" />
                Cancelar
              </button>
           </div>
        </div>
      </div>
    </div>

    <!-- Modal Cancelar -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showCancelModal = false">
      <div class="bg-white dark:bg-[rgb(var(--surface-100))] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[rgb(var(--neutral-200))]">
        <h3 class="text-lg font-bold text-[rgb(var(--neutral-900))] mb-4">Cancelar Venta #{{ ventaSeleccionada?.id }}</h3>
        <p class="text-sm text-[rgb(var(--neutral-500))] mb-4">Se restaurará el stock de los productos. Esta acción no se puede deshacer.</p>
        <textarea v-model="motivoCancelacion" placeholder="Motivo de la cancelación (requerido)"
          class="w-full px-4 py-3 rounded-xl border border-[rgb(var(--neutral-200))] bg-[rgb(var(--surface-50))] text-[rgb(var(--neutral-900))] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm placeholder:text-[rgb(var(--neutral-400))]"
          rows="3"></textarea>
        <div class="flex gap-3 mt-5">
          <button @click="showCancelModal = false" class="flex-1 py-2.5 rounded-xl text-white font-semibold text-xs transition-all">
            Volver
          </button>
          <button @click="cancelarVenta" :disabled="!motivoCancelacion.trim() || cancelando"
            class="flex-1 py-2.5 rounded-xl text-white font-semibold text-xs transition-all"
            :class="motivoCancelacion.trim() && !cancelando ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'">
            {{ cancelando ? 'Cancelando...' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from '@/composables/useToast'
import { History, Search, Receipt, Printer, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const toast = useToast()

const isDark = ref(document.documentElement.classList.contains('dark'))

  const busqueda = ref('')
  const fechaInicio = ref('')
  const fechaFin = ref('')
  const pagina = ref(1)
  const cargando = ref(false)
  const ventas = ref([])
  const ventaSeleccionada = ref(null)
  const itemsVenta = ref([])
  const totalPaginas = computed(() => Math.max(1, Math.ceil(ventas.value.length / 50)))

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-MX', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timeout = null
const buscar = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    pagina.value = 1
    fetchVentas()
  }, 300)
}

const fetchVentas = async () => {
  cargando.value = true
  try {
    const params = new URLSearchParams()
    if (busqueda.value) params.append('busqueda', busqueda.value)
    if (fechaInicio.value) params.append('fecha_inicio', fechaInicio.value)
    if (fechaFin.value) params.append('fecha_fin', fechaFin.value)
    params.append('limit', 50)
    params.append('offset', (pagina.value - 1) * 50)
    
    const { data } = await api.get(`/ventas/historial?${params}`)
    ventas.value = data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

const seleccionarVenta = async (venta) => {
  ventaSeleccionada.value = venta
  try {
    const { data } = await api.get(`/ventas/historial/${venta.id}`)
    itemsVenta.value = data.items || []
  } catch (e) {
    console.error(e)
  }
}

const reimprimir = async (venta) => {
  try {
    const { data } = await api.get(`/ventas/ticket-token/${venta.id}`)
    window.open(`/api/ventas/ticket/${venta.id}?token=${encodeURIComponent(data.token)}&paper=58`, '_blank')
  } catch (e) {
    console.error(e)
    toast.error('Error al reimprimir ticket')
  }
}

const paginaAnterior = () => {
  if (pagina.value > 1) {
    pagina.value--
    fetchVentas()
  }
}

const paginaSiguiente = () => {
  pagina.value++
  fetchVentas()
}

const showCancelModal = ref(false)
const motivoCancelacion = ref('')
const cancelando = ref(false)

const cancelarVenta = async () => {
  if (!ventaSeleccionada.value || !motivoCancelacion.value.trim()) return
  cancelando.value = true
  try {
    await api.post(`/ventas/cancelar/${ventaSeleccionada.value.id}`, { motivo: motivoCancelacion.value.trim() })
    showCancelModal.value = false
    motivoCancelacion.value = ''
    ventaSeleccionada.value = null
    fetchVentas()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error al cancelar venta')
  } finally {
    cancelando.value = false
  }
}

onMounted(() => {
  fetchVentas()
})
</script>
