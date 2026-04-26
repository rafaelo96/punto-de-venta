<template>
  <div class="h-full flex flex-col">
    <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
            <TrendingUp class="w-5 h-5" :style="{ color: colorPrincipal }" />
          </div>
          <h1 class="text-xl font-bold text-surface-900">Analytics de Negocio</h1>
        </div>
        <button @click="loadAnalytics" class="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <RotateCcw class="w-5 h-5 text-surface-400" />
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <!-- 1. Resumen de Métricas Rápidas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign class="w-5 h-5 text-green-600" />
            </div>
            <span class="text-sm text-surface-500">Ventas Hoy</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">${{ ventasHoy.toFixed(2) }}</p>
        </div>
        
        <div class="bg-white p-5 rounded-2xl border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Receipt class="w-5 h-5 text-blue-600" />
            </div>
            <span class="text-sm text-surface-500">Tickets Hoy</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">{{ ticketsHoy }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Package class="w-5 h-5 text-purple-600" />
            </div>
            <span class="text-sm text-surface-500">Productos Vendidos</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">{{ productosVendidos }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp class="w-5 h-5 text-emerald-600" />
            </div>
            <span class="text-sm text-surface-500">Ganancia Neta</span>
          </div>
          <p class="text-2xl font-bold text-emerald-600">${{ gananciaNeta.toFixed(2) }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Calculator class="w-5 h-5 text-orange-600" />
            </div>
            <span class="text-sm text-surface-500">Margen</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">{{ margenPorcentaje }}%</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gráfico de Tendencia (Línea) -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-surface-400" />
            Tendencia de Ventas (Últimos 30 días)
          </h3>
          <div class="h-80 w-full">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <!-- Distribución por Método de Pago -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-//surface-900 mb-4 flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-surface-400" />
            Métodos de Pago
          </h3>
          <div class="h-64 w-full flex items-center justify-center">
            <canvas id="paymentChart"></canvas>
          </div>
          <div class="mt-4 space-y-2">
            <div v-for="metodo in metodosPago" :key="metodo.metodo" class="flex items-center justify-between p-2 text-xs bg-surface-50 rounded-lg">
              <span class="text-surface-600 capitalize">{{ metodo.metodo }}</span>
              <span class="font-bold">${{ Number(metodo.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Productos -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Award class="w-5 h-5 text-surface-400" />
            Top Productos
          </h3>
          <div class="space-y-3">
            <div v-for="(prod, index) in topProductos" :key="index" class="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <span class="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-xs font-bold text-surface-500">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium text-surface-900 truncate">{{ prod.nombre }}</p>
                <p class="text-xs text-surface-500">{{ prod.cantidad }} unidades</p>
              </div>
              <span class="font-bold text-sm">${{ Number(prod.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Ventas por Categoría -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-//surface-900 mb-4 flex items-center gap-2">
            <Tag class="w-5 h-5 text-surface-400" />
            Por Categoría
          </h3>
          <div class="h-64 w-full flex items-center justify-center">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>

        <!-- Resumen Adicional -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Calculator class="w-5 h-5 text-surface-400" />
            Métricas de Eficiencia
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
              <span class="text-sm text-surface-600">Ticket Promedio</span>
              <span class="font-bold">${{ ticketPromedio.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
              <span class="text-sm text-surface-600">Costo Total Productos</span>
              <span class="font-bold text-red-500">${{ costoTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
              <span class="text-sm text-surface-600">Ingreso Bruto Hoy</span>
              <span class="font-bold text-green-600">${{ ventasHoy.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { 
  TrendingUp, DollarSign, Receipt, Package, Calculator,
  BarChart3, BarChart2, Award, CreditCard, Banknote, Send, Tag, RotateCcw
} from 'lucide-vue-next'
import { config } from '@/stores/config'
import axios from 'axios'
import Chart from 'chart.js/auto'

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const ventasHoy = ref(0)
const ticketsHoy = ref(0)
const productosVendidos = ref(0)
const gananciaNeta = ref(0)
const costoTotal = ref(0)
const metodosPago = ref([])
const topProductos = ref([])
const categoriasVentas = ref([])
const dailyStats = ref([])

const ticketPromedio = computed(() => ticketsHoy.value > 0 ? ventasHoy.value / ticketsHoy.value : 0)
const margenPorcentaje = computed(() => ventasHoy.value > 0 ? (gananciaNeta.value / ventasHoy.value) * 100 : 0)

const loadAnalytics = async () => {
  try {
    const token = localStorage.getItem('pos_token')
    
    // Cargar Dashboard
    const { data: dash } = await axios.get('/api/ventas/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Cargar Stats Diarios
    const { data: stats } = await axios.get('/api/ventas/stats/daily', {
      headers: { Authorization: `Bearer ${token}` }
    })

    ventasHoy.value = dash.resumen?.total || 0
    ticketsHoy.value = dash.resumen?.tickets || 0
    productosVendidos.value = dash.resumen?.productos_vendidos || 0
    gananciaNeta.value = dash.resumen?.ganancia_neta || 0
    metodosPago.value = dash.metodos || []
    topProductos.value = dash.top_productos || []
    categoriasVentas.value = dash.categorias || []
    dailyStats.value = stats
    
    costoTotal.value = ventasHoy.value - gananciaNeta.value

    await nextTick()
    initCharts()
  } catch (e) {
    console.error('Error loading analytics:', e)
  }
}

const initCharts = () => {
  // 1. Gráfico de Ventas Diarias (Línea)
  new Chart(document.getElementById('salesChart'), {
    type: 'line',
    data: {
      labels: dailyStats.value.map(d => d.fecha),
      datasets: [{
        label: 'Ventas Diarias',
        data: dailyStats.value.map(d => d.total),
        borderColor: colorPrincipal.value,
        backgroundColor: colorPrincipal.value + '20',
        fill: true,
        tension: 0.4
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
    }
  })

  // 2. Gráfico de Métodos de Pago (Dona)
  new Chart(document.getElementById('paymentChart'), {
    type: 'doughnut',
    data: {
      labels: metodosPago.value.map(m => m.metodo),
      datasets: [{
        data: metodosPago.value.map(m => m.total),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  })

  // 3. Gráfico de Categorías (Barras Horizontales)
  new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: {
      labels: categoriasVentas.value.map(c => c.categoria),
      datasets: [{
        label: 'Total Ventas',
        data: categoriasVentas.value.map(c => c.total),
        backgroundColor: colorPrincipal.value
      }]
    },
    options: { 
      indexAxis: 'y', 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  })
}

onMounted(async () => {
  await loadAnalytics()
})
</script>
