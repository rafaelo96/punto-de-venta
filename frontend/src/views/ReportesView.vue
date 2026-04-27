<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
    <header class="px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: colorPrincipal }">
          <FileText class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Reportes</h1>
          <p class="text-sm text-neutral-500">Análisis por período de tiempo</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Selector de Fechas -->
        <div class="section-container">
          <div class="flex flex-wrap items-end gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-neutral-700">Fecha Inicio</label>
              <input
                type="date"
                v-model="fechaInicio"
                class="px-4 py-3 rounded-xl border bg-neutral-50 border-neutral-200"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-neutral-700">Fecha Fin</label>
              <input
                type="date"
                v-model="fechaFin"
                class="px-4 py-3 rounded-xl border bg-neutral-50 border-neutral-200"
              />
            </div>
            <button @click="cargarReportes" class="btn flex items-center gap-2 px-5 py-3">
              <Search class="w-5 h-5" />
              Buscar
            </button>
            <div class="flex gap-2 ml-auto">
              <button @click="setPeriodo('hoy')" class="btn-ghost text-sm">Hoy</button>
              <button @click="setPeriodo('semana')" class="btn-ghost text-sm">Esta Semana</button>
              <button @click="setPeriodo('mes')" class="btn-ghost text-sm">Este Mes</button>
            </div>
          </div>
        </div>

        <!-- Cargando -->
        <div v-if="cargando" class="text-center py-12">
          <div class="animate-spin w-8 h-8 rounded-full border-2 border-transparent mx-auto" :style="{ borderTopColor: colorPrincipal }"></div>
        </div>

        <!-- Resultados -->
        <template v-else-if="reportes">
          <!-- Resumen -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="section-container text-center">
              <p class="text-sm mb-1 text-neutral-500">Total Ventas</p>
              <p class="text-2xl font-bold" :style="{ color: colorPrincipal }">${{ formatNumber(resumen.total_ventas) }}</p>
            </div>
            <div class="section-container text-center">
              <p class="text-sm mb-1 text-neutral-500">Tickets</p>
              <p class="text-2xl font-bold text-neutral-900">{{ resumen.num_tickets }}</p>
            </div>
            <div class="section-container text-center">
              <p class="text-sm mb-1 text-neutral-500">Productos</p>
              <p class="text-2xl font-bold text-neutral-900">{{ resumen.productos_vendidos }}</p>
            </div>
            <div class="section-container text-center">
              <p class="text-sm mb-1 text-neutral-500">Ganancia</p>
              <p class="text-2xl font-bold text-emerald-600">${{ formatNumber(resumen.ganancia_neta) }}</p>
            </div>
            <div class="section-container text-center">
              <p class="text-sm mb-1 text-neutral-500">Ticket Promedio</p>
              <p class="text-2xl font-bold text-neutral-900">${{ formatNumber(ticketPromedio) }}</p>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Ventas Diarias -->
            <div class="section-container">
              <h3 class="font-semibold mb-4 text-neutral-900">Ventas Diarias</h3>
              <div class="h-64">
                <Bar :data="chartData.daily" :options="chartOptions" />
              </div>
            </div>

            <!-- Métodos de Pago -->
            <div class="section-container">
              <h3 class="font-semibold mb-4 text-neutral-900">Métodos de Pago</h3>
              <div class="h-64">
                <Doughnut :data="chartData.metodos" :options="chartOptionsDoughnut" />
              </div>
            </div>

            <!-- Categorías -->
            <div class="section-container">
              <h3 class="font-semibold mb-4 text-neutral-900">Por Categoría</h3>
              <div class="h-64">
                <Pie :data="chartData.categorias" :options="chartOptionsDoughnut" />
              </div>
            </div>

            <!-- Top Productos -->
            <div class="section-container">
              <h3 class="font-semibold mb-4 text-neutral-900">Top Productos</h3>
              <div class="space-y-3 max-h-64 overflow-auto">
                <div v-for="(prod, i) in top_productos" :key="i" class="flex items-center justify-between p-3 rounded-xl bg-neutral-50">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" :style="{ backgroundColor: colorPrincipal, color: 'white' }">{{ i + 1 }}</span>
                    <span class="text-neutral-900">{{ prod.nombre }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold" :style="{ color: colorPrincipal }">${{ formatNumber(prod.total) }}</p>
                    <p class="text-xs text-neutral-500">{{ prod.cantidad }} uds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stock Bajo -->
          <div v-if="stock_bajo.length" class="section-container">
            <h3 class="font-semibold mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle class="w-5 h-5" />
              Productos con Stock Bajo
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="prod in stock_bajo" :key="prod.id" class="p-4 rounded-xl flex items-center justify-between bg-neutral-50">
                <div>
                  <p class="font-medium text-neutral-900">{{ prod.nombre }}</p>
                  <p class="text-xs text-neutral-500">Mín: {{ prod.stock_minimo }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-red-500">{{ prod.stock }}</p>
                  <p class="text-xs text-neutral-500">disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Sin resultados -->
        <div v-else class="text-center py-12">
          <FileText class="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <p class="text-neutral-500">Selecciona un rango de fechas para ver el reporte</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Bar, Doughnut, Pie } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import axios from 'axios'
import { FileText, Search, AlertTriangle } from 'lucide-vue-next'
import { config, fetchConfig } from '@/stores/config'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')
const fechaInicio = ref('')
const fechaFin = ref(new Date().toISOString().split('T')[0])
const cargando = ref(false)
const reportes = ref(null)

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const resumen = computed(() => reportes.value?.resumen || { total_ventas: 0, num_tickets: 0, productos_vendidos: 0, ganancia_neta: 0 })
const top_productos = computed(() => reportes.value?.top_productos || [])
const stock_bajo = computed(() => reportes.value?.stock_bajo || [])

const ticketPromedio = computed(() => {
  if (!resumen.value.num_tickets) return 0
  return resumen.value.total_ventas / resumen.value.num_tickets
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0)
}

const setPeriodo = (periodo) => {
  const hoy = new Date()
  let inicio = new Date()
  
  if (periodo === 'hoy') {
    inicio = hoy
  } else if (periodo === 'semana') {
    const dia = hoy.getDay()
    inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - dia + (dia === 0 ? -6 : 1))
  } else if (periodo === 'mes') {
    inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  }
  
  fechaInicio.value = inicio.toISOString().split('T')[0]
  fechaFin.value = hoy.toISOString().split('T')[0]
  cargarReportes()
}

const cargarReportes = async () => {
  if (!fechaInicio.value || !fechaFin.value) return
  
  cargando.value = true
  try {
    const { data } = await api.get('/ventas/reportes', {
      params: { fecha_inicio: fechaInicio.value, fecha_fin: fechaFin.value }
    })
    reportes.value = data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

const chartData = computed(() => {
  if (!reportes.value) return { daily: {}, metodos: {}, categorias: {} }
  const brightColors = [
    colorPrincipal.value,
    '#22c55e',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
    '#f97316',
    '#14b8a6'
  ]
  
  return {
    daily: {
      labels: reportes.value.ventas_diarias.map(v => new Date(v.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Ventas',
        data: reportes.value.ventas_diarias.map(v => v.total),
        backgroundColor: brightColors[0],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    metodos: {
      labels: reportes.value.metodos.map(m => m.metodo),
      datasets: [{
        data: reportes.value.metodos.map(m => m.total),
        backgroundColor: brightColors.slice(0, reportes.value.metodos.length),
        borderWidth: 3,
        borderColor: 'white'
      }]
    },
    categorias: {
      labels: reportes.value.categorias.map(c => c.categoria),
      datasets: [{
        data: reportes.value.categorias.map(c => c.total),
        backgroundColor: brightColors.slice(0, reportes.value.categorias.length),
        borderWidth: 3,
        borderColor: 'white'
      }]
    }
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6b7280' } },
    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280', callback: v => '$' + v } }
  }
}

const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right', labels: { color: '#6b7280', usePointStyle: true, padding: 20 } } }
}

onMounted(async () => {
  await fetchConfig()
  setPeriodo('hoy')
})
</script>

<style scoped>
.section-container {
  @apply p-6 rounded-2xl;
  @apply bg-white/80 backdrop-blur-xl border border-neutral-200/50;
}
.dark .section-container {
  @apply bg-neutral-800/80 border-neutral-700;
}
</style>