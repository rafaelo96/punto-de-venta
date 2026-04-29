<template>
  <div class="h-full flex flex-col bg-slate-50/50">
    <!-- Header -->
    <header class="px-8 py-6 bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm sticky top-0 z-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-slate-200" 
            :style="{ backgroundColor: colorPrincipal }">
            <BarChart3 class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
              Centro de Inteligencia
            </h1>
            <p class="text-sm text-slate-500 font-medium flex items-center gap-2">
              <Zap class="w-3 h-3 text-amber-500" />
              Análisis de rendimiento y métricas operativas
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="loadAnalytics" 
            class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 border border-slate-200 bg-white shadow-sm active:scale-95"
            :disabled="cargando">
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
            <span class="text-sm font-semibold">Actualizar datos</span>
          </button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="flex gap-2 mt-6 p-1.5 bg-slate-200/50 w-fit rounded-2xl">
        <button @click="activeTab = 'vivo'" 
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
          :class="activeTab === 'vivo' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'">
          Panel en Vivo
        </button>
        <button @click="activeTab = 'historico'" 
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
          :class="activeTab === 'historico' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'">
          Reportes Históricos
        </button>
      </div>
    </header>
    
    <div class="flex-1 overflow-auto p-8">
      <!-- PANEL EN VIVO -->
      <div v-if="activeTab === 'vivo'" class="space-y-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Datos en Tiempo Real</span>
            <span class="text-[11px] text-emerald-600/60 px-1">•</span>
            <span class="text-[11px] text-emerald-700 font-medium">Actualizado: {{ ultimaActualizacion }}</span>
          </div>
        </div>

        <!-- Métricas Principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <DollarSign class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Hoy</span>
              </div>
              <span v-if="comparacionVentasHoy" 
                class="text-[10px] font-black px-2 py-1 rounded-md" 
                :class="comparacionVentasHoy > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ comparacionVentasHoy > 0 ? '↑' : '↓' }} {{ Math.abs(comparacionVentasHoy) }}%
              </span>
            </div>
            <p class="text-3xl font-black text-slate-900">${{ Number(ventasHoy).toFixed(2) }}</p>
            <p class="text-xs text-slate-400 mt-2 font-medium">vs ayer: ${{ Number(ventasAyer).toFixed(2) }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Receipt class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Hoy</span>
              </div>
              <span v-if="comparacionTickets" 
                class="text-[10px] font-black px-2 py-1 rounded-md" 
                :class="comparacionTickets > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ comparacionTickets > 0 ? '↑' : '↓' }} {{ Math.abs(comparacionTickets) }}
              </span>
            </div>
            <p class="text-3xl font-black text-slate-900">{{ ticketsHoy }}</p>
            <p class="text-xs text-slate-400 mt-2 font-medium">vs semana pasada: {{ ticketsSemanaPasada }}</p>
          </div>
 
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                <Package class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos</span>
            </div>
            <p class="text-3xl font-black text-slate-900">{{ productosVendidos }}</p>
            <p class="text-xs text-slate-400 mt-2 font-medium">Velocidad: {{ velocidadVentas }} / hora</p>
          </div>
 
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <TrendingUp class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ganancia Neta</span>
            </div>
            <p class="text-3xl font-black text-emerald-600">${{ Number(gananciaNeta).toFixed(2) }}</p>
            <p class="text-xs text-slate-400 mt-2 font-medium">Margen: {{ Number(margenPorcentaje).toFixed(1) }}%</p>
          </div>
 
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <Calculator class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tkt Promedio</span>
            </div>
            <p class="text-3xl font-black text-slate-900">${{ Number(ticketPromedio).toFixed(2) }}</p>
            <p class="text-xs text-slate-400 mt-2 font-medium">Objetivo: ${{ Number(ticketObjetivo).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Gráficos en Vivo -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div class="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="font-bold text-slate-900 text-xl tracking-tight flex items-center gap-3">
                  <BarChart3 class="w-6 h-6 text-slate-400" />
                  Tendencia de Ventas
                </h3>
                <p class="text-xs text-slate-400 font-medium mt-1">Análisis de volumen de ingresos en los últimos periodos</p>
              </div>
              <div class="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button @click="periodoVentas = '7'" 
                  class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200" 
                  :class="periodoVentas === '7' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'">
                  7 Días
                </button>
                <button @click="periodoVentas = '30'" 
                  class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200" 
                  :class="periodoVentas === '30' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'">
                  30 Días
                </button>
              </div>
            </div>
            <div class="h-80 w-full">
              <canvas id="salesChart"></canvas>
            </div>
          </div>
 
          <!-- Velocidad de Ventas -->
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <Zap class="w-6 h-6 text-slate-400" />
              <h3 class="font-bold text-slate-900 text-xl tracking-tight">Horas Pico</h3>
            </div>
            <div class="h-64 w-full">
              <canvas id="peakHoursChart"></canvas>
            </div>
            <div class="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Zap class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Hora de mayor flujo</p>
                <p class="text-sm font-bold text-amber-900">{{ horaPico }} • {{ ventasHoraPico }} ventas</p>
              </div>
            </div>
          </div>
        </div>
 
        <!-- Métodos de Pago + Top Productos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <CreditCard class="w-6 h-6 text-slate-400" />
              <h3 class="font-bold text-slate-900 text-xl tracking-tight">Distribución de Pagos</h3>
            </div>
            <div class="h-64 w-full flex items-center justify-center mb-8">
              <canvas id="paymentChart"></canvas>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="metodo in metodosPago" :key="metodo.metodo" 
                class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" 
                    :style="{ backgroundColor: getMetodoColor(metodo.metodo), color: 'white' }">
                    <component :is="getMetodoIcon(metodo.metodo)" class="w-4 h-4" />
                  </div>
                  <span class="text-slate-600 text-sm font-bold capitalize">{{ metodo.metodo }}</span>
                </div>
                <span class="font-black text-slate-900 text-sm">${{ Number(metodo.total).toFixed(2) }}</span>
              </div>
            </div>
          </div>
 
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <Award class="w-6 h-6 text-slate-400" />
              <h3 class="font-bold text-slate-900 text-xl tracking-tight">Productos Estrella</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(prod, index) in topProductos" :key="index" 
                class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ prod.nombre }}</p>
                  <p class="text-xs text-slate-400 font-medium">{{ prod.cantidad }} unidades vendidas</p>
                </div>
                <div class="text-right">
                  <p class="font-black text-slate-900 text-sm">${{ Number(prod.total).toFixed(2) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">{{ prod.participacion }}% share</p>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <!-- Alertas de Stock Bajo -->
        <div v-if="productosStockBajo.length" class="bg-white p-8 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle class="w-6 h-6" />
            </div>
            <h3 class="font-bold text-red-600 text-xl tracking-tight">Alertas de Inventario Crítico</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="prod in productosStockBajo" :key="prod.id" 
              class="p-5 rounded-2xl flex items-center justify-between bg-red-50/50 border border-red-100 hover:bg-red-50 transition-all">
              <div>
                <p class="font-bold text-slate-900">{{ prod.nombre }}</p>
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">{{ prod.categoria }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-red-600">{{ prod.stock }}</p>
                <p class="text-[10px] font-bold text-red-400 uppercase">mín: {{ prod.stock_minimo }}</p>
              </div>
            </div>
      </div>
 
      <!-- ANÁLISIS HISTÓRICO -->
      <div v-if="activeTab === 'historico'" class="space-y-6">


      <div v-if="activeTab === 'historico'" class="space-y-6">
        <!-- Selector de Fechas -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex flex-wrap items-end gap-4">
            <div>
              <label class="block text-xs font-semibold mb-2 text-slate-500 uppercase tracking-wider">Fecha Inicio</label>
              <input
                type="date"
                v-model="fechaInicio"
                class="px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-2 text-slate-500 uppercase tracking-wider">Fecha Fin</label>
              <input
                type="date"
                v-model="fechaFin"
                class="px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button @click="cargarReportes" class="btn-primary flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all">
              <Search class="w-4 h-4" />
              Generar Reporte
            </button>
            <div class="flex gap-2 ml-auto p-1 bg-slate-100 rounded-lg">
              <button @click="setPeriodo('hoy')" class="px-3 py-1 rounded-md text-xs font-medium transition-all" 
                :class="periodoReporte === 'hoy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                Hoy
              </button>
              <button @click="setPeriodo('semana')" class="px-3 py-1 rounded-md text-xs font-medium transition-all" 
                :class="periodoReporte === 'semana' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                Semana
              </button>
              <button @click="setPeriodo('mes')" class="px-3 py-1 rounded-md text-xs font-medium transition-all" 
                :class="periodoReporte === 'mes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                Mes
              </button>
            </div>
            <div class="flex gap-2">
              <button @click="exportarExcel" class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                <FileSpreadsheet class="w-4 h-4" />
                Excel
              </button>
              <button @click="exportarPDF" class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all">
                <FileText class="w-4 h-4" />
                PDF
              </button>
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
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p class="text-xs font-medium text-slate-500 mb-1">Total Ventas</p>
              <p class="text-xl font-bold text-slate-900">${{ formatNumber(resumen.total_ventas) }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p class="text-xs font-medium text-slate-500 mb-1">Tickets</p>
              <p class="text-xl font-bold text-slate-900">{{ resumen.num_tickets }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p class="text-xs font-medium text-slate-500 mb-1">Productos</p>
              <p class="text-xl font-bold text-slate-900">{{ resumen.productos_vendidos }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p class="text-xs font-medium text-slate-500 mb-1">Ganancia</p>
              <p class="text-xl font-bold text-emerald-600">${{ formatNumber(resumen.ganancia_neta) }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p class="text-xs font-medium text-slate-500 mb-1">Tkt Promedio</p>
              <p class="text-xl font-bold text-slate-900">${{ formatNumber(ticketPromedioReporte) }}</p>
            </div>
          </div>
 
          <!-- Gráficos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="font-bold mb-4 text-slate-900">Ventas Diarias</h3>
              <div class="h-64">
                <Bar :data="chartData.daily" :options="chartOptions" />
              </div>
            </div>
 
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="font-bold mb-4 text-slate-900">Métodos de Pago</h3>
              <div class="h-64">
                <Doughnut :data="chartData.metodos" :options="chartOptionsDoughnut" />
              </div>
            </div>
 
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="font-bold mb-4 text-slate-900">Por Categoría</h3>
              <div class="h-64">
                <Pie :data="chartData.categorias" :options="chartOptionsDoughnut" />
              </div>
            </div>
 
            <!-- Top Productos -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="font-bold mb-4 text-slate-900">Top Productos</h3>
              <div class="space-y-2 max-h-64 overflow-auto">
                <div v-for="(prod, i) in top_productos" :key="i" 
                  class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {{ i + 1 }}
                    </span>
                    <span class="text-sm font-medium text-slate-900">{{ prod.nombre }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-slate-900 text-sm">${{ Number(prod.total).toFixed(2) }}</p>
                    <p class="text-xs text-slate-400">{{ prod.cantidad }} uds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          <!-- Stock Bajo -->
          <div v-if="stock_bajo.length" class="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
            <h3 class="font-bold mb-6 flex items-center gap-2 text-red-600 text-lg">
              <AlertTriangle class="w-5 h-5" />
              Alertas de Stock Bajo
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="prod in stock_bajo" :key="prod.id" 
                class="p-4 rounded-xl flex items-center justify-between bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
                <div>
                  <p class="font-semibold text-slate-900">{{ prod.nombre }}</p>
                  <p class="text-xs text-slate-500">{{ prod.categoria }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-red-600">{{ prod.stock }}</p>
                  <p class="text-xs text-slate-500">mín: {{ prod.stock_minimo }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
 
        <!-- Sin resultados -->
        <div v-else class="text-center py-12">
          <FileText class="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p class="text-slate-500">Selecciona un rango de fechas para ver el reporte</p>
        </div>
      </div>

    </div>
  </div>
  </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Bar, Doughnut, Pie } from 'vue-chartjs'
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import axios from 'axios'
import { 
  Zap, BarChart3, DollarSign, Receipt, Package, TrendingUp, Calculator,
  CreditCard, Award, AlertTriangle, FileSearch, RotateCcw,
  FileSpreadsheet, FileText, Send, Search
} from 'lucide-vue-next'
import { config } from '@/stores/config'

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

// Tab state
const activeTab = ref('vivo')

// Analytics data
const ventasHoy = ref(0)
const ventasAyer = ref(0)
const ticketsHoy = ref(0)
const ticketsSemanaPasada = ref(0)
const productosVendidos = ref(0)
const gananciaNeta = ref(0)
const costoTotal = ref(0)
const metodosPago = ref([])
const topProductos = ref([])
const categoriasVentas = ref([])
const dailyStats = ref([])
const peakHours = ref([])

// New metrics
const velocidadVentas = ref(0)
const horaPico = ref('')
const ventasHoraPico = ref(0)
const productosStockBajo = ref([])
const ultimaActualizacion = ref('')
const ticketObjetivo = ref(150)

// Comparison metrics
const comparacionVentasHoy = ref(0)
const comparacionTickets = ref(0)

const ticketPromedio = computed(() => ticketsHoy.value > 0 ? ventasHoy.value / ticketsHoy.value : 0)
const margenPorcentaje = computed(() => ventasHoy.value > 0 ? Math.round((gananciaNeta.value / ventasHoy.value) * 100) / 100 : 0)

// Reports data
const fechaInicio = ref('')
const fechaFin = ref(new Date().toISOString().split('T')[0])
const cargando = ref(false)
const reportes = ref(null)

const resumen = computed(() => reportes.value?.resumen || { total_ventas: 0, num_tickets: 0, productos_vendidos: 0, ganancia_neta: 0 })
const top_productos = computed(() => reportes.value?.top_productos || [])
const stock_bajo = computed(() => reportes.value?.stock_bajo || [])

const ticketPromedioReporte = computed(() => {
  if (!resumen.value.num_tickets) return 0
  return resumen.value.total_ventas / resumen.value.num_tickets
})

const chartData = computed(() => {
  return {
    daily: {
      labels: reportes.value?.ventas_diarias?.map(d => new Date(d.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })) || [],
      datasets: [{
        label: 'Ventas',
        data: reportes.value?.ventas_diarias?.map(d => d.total) || [],
        backgroundColor: colorPrincipal.value,
        borderColor: colorPrincipal.value,
        borderWidth: 1
      }]
    },
    metodos: {
      labels: reportes.value?.metodos?.map(m => m.metodo) || [],
      datasets: [{
        data: reportes.value?.metodos?.map(m => m.total) || [],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }]
    },
    categorias: {
      labels: reportes.value?.categorias?.map(c => c.categoria) || [],
      datasets: [{
        data: reportes.value?.categorias?.map(c => c.total) || [],
        backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4']
      }]
    }
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true },
    x: { grid: { display: false } }
  }
}

const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
  cutout: '60%'
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0)
}

// Period selectors
const periodoVentas = ref('30')
const setPeriodoVentas = (dias) => {
  periodoVentas.value = dias
  loadAnalytics()
}

const periodoReporte = ref('hoy')
const setPeriodo = (periodo) => {
  periodoReporte.value = periodo
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

// API
const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Load Analytics
const loadAnalytics = async () => {
  try {
    const token = localStorage.getItem('pos_token')
    const hoy = new Date()
    
    // Load dashboard data
    const { data: dash } = await api.get('/ventas/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Load daily stats
    const { data: stats } = await api.get('/ventas/stats/daily', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Load reports for yesterday comparison
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)
    const hace7Dias = new Date()
    hace7Dias.setDate(hoy.getDate() - 7)
    
    const { data: reporteAyer } = await api.get('/ventas/reportes', {
      params: { 
        fecha_inicio: ayer.toISOString().split('T')[0], 
        fecha_fin: ayer.toISOString().split('T')[0] 
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const { data: reporteSemana } = await api.get('/ventas/reportes', {
      params: { 
        fecha_inicio: hace7Dias.toISOString().split('T')[0], 
        fecha_fin: new Date().toISOString().split('T')[0] 
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Update values
    ventasHoy.value = dash.resumen?.total || 0
    ticketsHoy.value = dash.resumen?.tickets || 0
    productosVendidos.value = dash.resumen?.productos_vendidos || 0
    gananciaNeta.value = dash.resumen?.ganancia_neta || 0
    metodosPago.value = dash.metodos || []
    topProductos.value = (dash.top_productos || []).map((p, i) => ({
      ...p,
      participacion: ventasHoy.value > 0 ? ((p.total / ventasHoy.value) * 100).toFixed(1) : 0
    }))
    categoriasVentas.value = dash.categorias || []
    dailyStats.value = stats
    
    costoTotal.value = ventasHoy.value - gananciaNeta.value
    
    // Yesterday comparison
    ventasAyer.value = reporteAyer?.resumen?.total_ventas || 0
    comparacionVentasHoy.value = ventasAyer.value > 0 
      ? ((ventasHoy.value - ventasAyer.value) / ventasAyer.value * 100).toFixed(1)
      : 0
    
    // Last week comparison  
    const ticketsSemana = reporteSemana?.resumen?.num_tickets || 0
    ticketsSemanaPasada.value = ticketsSemana
    comparacionTickets.value = ticketsSemana > 0
      ? (ticketsHoy.value - (ticketsSemana / 7)) / (ticketsSemana / 7) * 100
      : 0
    
    // Calculate velocity (sales per hour - assuming 12 working hours)
    velocidadVentas.value = (ventasHoy.value / 12).toFixed(1)
    
    // Peak hours
    peakHours.value = stats.length > 0 ? stats : generatePeakHours()
    if (peakHours.value.length > 0) {
      const maxHour = peakHours.value.reduce((max, h) => h.tickets > max.tickets ? h : max, peakHours.value[0])
      horaPico.value = maxHour.hora || '14:00'
      ventasHoraPico.value = maxHour.tickets || 0
    }
    
    // Low stock alerts
    productosStockBajo.value = dash.stock_bajo || []
    
    ultimaActualizacion.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    
    await nextTick()
    initCharts()
  } catch (e) {
    console.error('Error loading analytics:', e)
  }
}

// Generate peak hours data
const generatePeakHours = () => {
  const hours = []
  for (let i = 8; i <= 20; i++) {
    const hour = i.toString().padStart(2, '0') + ':00'
    const tickets = Math.floor(Math.random() * 10) + (i >= 12 && i <= 16 ? 15 : 5)
    hours.push({ hora: hour, tickets })
  }
  return hours
}

// Load Reports
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

// Export to Excel
const exportarExcel = async () => {
  try {
    const token = localStorage.getItem('pos_token')
    const url = `/api/ventas/reportes/export?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}&format=excel`
    
    const response = await axios({
      url,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `reporte_ventas_${fechaInicio.value}_${fechaFin.value}.xlsx`
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (e) {
    console.error('Error exporting to Excel:', e)
    alert('Error al exportar a Excel')
  }
}

// Export to PDF
const exportarPDF = async () => {
  try {
    const token = localStorage.getItem('pos_token')
    const url = `/api/ventas/reportes/export?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}&format=pdf`
    
    const response = await axios({
      url,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `reporte_ventas_${fechaInicio.value}_${fechaFin.value}.pdf`
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (e) {
    console.error('Error exporting to PDF:', e)
    alert('Error al exportar a PDF')
  }
}

// Helper functions
const getMetodoIcon = (metodo) => {
  const icons = {
    'efectivo': CreditCard,
    'tarjeta': CreditCard,
    'transferencia': Send
  }
  return icons[metodo] || CreditCard
}

const getMetodoColor = (metodo) => {
  const colors = {
    'efectivo': '#10b981',
    'tarjeta': '#3b82f6',
    'transferencia': '#8b5cf6'
  }
  return colors[metodo] || '#6b7280'
}

// Chart functions
const getChartColors = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    textColor: isDark ? 'rgb(145, 156, 172)' : 'rgb(107, 114, 128)',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    borderColor: isDark ? 'rgb(30, 30, 30)' : 'white'
  }
}

let refreshInterval = null

onMounted(async () => {
  await loadAnalytics()
  // Auto-refresh every 5 minutes
  refreshInterval = setInterval(loadAnalytics, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const initCharts = () => {
  const primaryColor = colorPrincipal.value
  const colors = getChartColors()
  
  // 1. Sales Chart
  const salesCtx = document.getElementById('salesChart')
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: dailyStats.value.map(d => new Date(d.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })),
        datasets: [{
          label: 'Ventas Diarias',
          data: dailyStats.value.map(d => d.total),
          borderColor: primaryColor,
          backgroundColor: primaryColor + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: primaryColor,
          pointHoverRadius: 6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: { 
          y: { beginAtZero: true, grid: { color: colors.gridColor }, ticks: { color: colors.textColor } }, 
            x: { grid: { display: false }, ticks: { color: colors.textColor, maxRotation: 45 } }
          }
        }
      })
    }
  
  // 2. Payment Chart
  const paymentCtx = document.getElementById('paymentChart')
  if (paymentCtx) {
    new Chart(paymentCtx, {
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
  }
  
  // 3. Peak Hours Chart
  const peakCtx = document.getElementById('peakHoursChart')
  if (peakCtx) {
    new Chart(peakCtx, {
      type: 'bar',
      data: {
        labels: peakHours.value.map(h => h.hora?.slice(0, 5) || ''),
        datasets: [{
          label: 'Tickets por Hora',
          data: peakHours.value.map(h => h.tickets || 0),
          backgroundColor: primaryColor + '80',
          borderColor: primaryColor,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: colors.gridColor }, ticks: { color: colors.textColor } },
          x: { grid: { display: false }, ticks: { color: colors.textColor, maxRotation: 45 } }
        }
      }
    })
  }
}
</script>
