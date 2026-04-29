<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100">
    <header class="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 px-8 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: colorPrincipal }">
            <TrendingUp class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Analytics de Negocio</h1>
            <p class="text-sm text-neutral-500">Resumen de ventas y métricas clave</p>
          </div>
        </div>
        <button @click="loadAnalytics" class="p-3 hover:bg-neutral-100/80 rounded-xl transition-all duration-300 hover-lift shadow-soft">
          <RotateCcw class="w-5 h-5 text-neutral-500" />
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <div class="card-elevated p-6 group hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner">
              <DollarSign class="w-5 h-5 text-emerald-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Ventas Hoy</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900">${{ Number(ventasHoy).toFixed(2) }}</p>
        </div>
        
        <div class="card-elevated p-6 group hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shadow-inner">
              <Receipt class="w-5 h-5 text-blue-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Tickets Hoy</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900">{{ ticketsHoy }}</p>
        </div>

        <div class="card-elevated p-6 group hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shadow-inner">
              <Package class="w-5 h-5 text-violet-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Productos Vendidos</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900">{{ productosVendidos }}</p>
        </div>

        <div class="card-elevated p-6 group hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shadow-inner">
              <TrendingUp class="w-5 h-5 text-amber-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Ganancia Neta</span>
          </div>
          <p class="text-2xl font-bold text-emerald-600">${{ Number(gananciaNeta).toFixed(2) }}</p>
        </div>

        <div class="card-elevated p-6 group hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shadow-inner">
              <Calculator class="w-5 h-5 text-orange-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Margen</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900">{{ Number(margenPorcentaje).toFixed(2) }}%</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 section-container">
          <h3 class="font-semibold text-neutral-900 mb-6 flex items-center gap-3 text-lg">
            <BarChart3 class="w-6 h-6 text-neutral-400" />
            Tendencia de Ventas (Últimos 30 días)
          </h3>
          <div class="h-80 w-full">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <div class="section-container">
           <h3 class="font-semibold text-neutral-900 mb-6 flex items-center gap-3 text-lg">
             <CreditCard class="w-6 h-6 text-neutral-400" />
             Métodos de Pago
           </h3>
          <div class="h-64 w-full flex items-center justify-center">
            <canvas id="paymentChart"></canvas>
          </div>
          <div class="mt-6 space-y-3">
            <div v-for="metodo in metodosPago" :key="metodo.metodo" class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all">
              <span class="text-neutral-600 font-medium capitalize">{{ metodo.metodo }}</span>
              <span class="font-bold text-neutral-900">${{ Number(metodo.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="section-container">
          <h3 class="font-semibold text-neutral-900 mb-6 flex items-center gap-3 text-lg">
            <Award class="w-6 h-6 text-neutral-400" />
            Top Productos
          </h3>
          <div class="space-y-3">
            <div v-for="(prod, index) in topProductos" :key="index" class="flex items-center gap-4 p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all hover-lift">
              <span class="w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="text-sm font-semibold text-neutral-900 truncate">{{ prod.nombre }}</p>
                <p class="text-xs text-neutral-500">{{ prod.cantidad }} unidades</p>
              </div>
              <span class="font-bold text-neutral-900">${{ Number(prod.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="section-container">
           <h3 class="font-semibold text-neutral-900 mb-6 flex items-center gap-3 text-lg">
             <Tag class="w-6 h-6 text-neutral-400" />
             Por Categoría
           </h3>
          <div class="h-64 w-full flex items-center justify-center">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>

        <div class="section-container">
          <h3 class="font-semibold text-neutral-900 mb-6 flex items-center gap-3 text-lg">
            <Calculator class="w-6 h-6 text-neutral-400" />
            Métricas de Eficiencia
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all">
              <span class="text-neutral-600 font-medium">Ticket Promedio</span>
              <span class="font-bold text-neutral-900">${{ Number(ticketPromedio).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all">
              <span class="text-neutral-600 font-medium">Costo Total Productos</span>
              <span class="font-bold text-red-500">${{ Number(costoTotal).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all">
              <span class="text-neutral-600 font-medium">Ingreso Bruto Hoy</span>
              <span class="font-bold text-emerald-600">${{ Number(ventasHoy).toFixed(2) }}</span>
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
const margenPorcentaje = computed(() => ventasHoy.value > 0 ? Math.round((gananciaNeta.value / ventasHoy.value) * 100 * 100) / 100 : 0)

const loadAnalytics = async () => {
  try {
    const token = localStorage.getItem('pos_token')
    
    const { data: dash } = await axios.get('/api/ventas/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
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

const getChartColors = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    textColor: isDark ? 'rgb(145, 156, 172)' : 'rgb(107, 114, 128)',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    borderColor: isDark ? 'rgb(30, 30, 30)' : 'white'
  }
}

const initCharts = () => {
  const primaryColor = colorPrincipal.value
  const colors = getChartColors()
  
  // 1. Gráfico de Ventas Diarias (Línea)
  new Chart(document.getElementById('salesChart'), {
    type: 'line',
    data: {
      labels: dailyStats.value.map(d => d.fecha),
      datasets: [{
        label: 'Ventas Diarias',
        data: dailyStats.value.map(d => d.total),
        borderColor: primaryColor,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: primaryColor
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { 
        y: { beginAtZero: true, grid: { color: colors.gridColor }, ticks: { color: colors.textColor } }, 
        x: { grid: { display: false }, ticks: { color: colors.textColor } } 
      }
    }
  })

  // 2. Gráfico de Métodos de Pago (Dona)
  new Chart(document.getElementById('paymentChart'), {
    type: 'doughnut',
    data: {
      labels: metodosPago.value.map(m => m.metodo),
      datasets: [{
        data: metodosPago.value.map(m => m.total),
        backgroundColor: [primaryColor, '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'],
        borderWidth: 3,
        borderColor: colors.borderColor
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      plugins: { legend: { display: false } },
      cutout: '60%'
    }
  })

  // 3. Gráfico de Categorías (Barras Horizontales)
  new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: {
      labels: categoriasVentas.value.map(c => c.categoria),
      datasets: [{
        label: 'Total Ventas',
        data: categoriasVentas.value.map(c => c.total),
        backgroundColor: primaryColor,
        borderRadius: 6
      }]
    },
    options: { 
      indexAxis: 'y', 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { 
        x: { grid: { color: colors.gridColor }, ticks: { color: colors.textColor } }, 
        y: { grid: { display: false }, ticks: { color: colors.textColor } }
      }
    }
  })
}

onMounted(async () => {
  await loadAnalytics()
})
</script>