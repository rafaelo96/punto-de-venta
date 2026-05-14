<template>
  <div class="h-full flex flex-col bg-neutral-50/50 relative">
    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="notification" 
        class="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-sm"
        :class="notification.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'">
        <AlertTriangle v-if="notification.type === 'error'" class="w-5 h-5 text-red-500" />
        <Zap v-else class="w-5 h-5 text-emerald-500" />
        <span class="text-sm font-semibold">{{ notification.message }}</span>
        <button @click="notification = null" class="ml-2 hover:opacity-70 transition-opacity">
          <FileText class="w-4 h-4" />
        </button>
      </div>
    </Transition>
    
    <!-- Header -->
    <header class="px-8 py-6 bg-white/70 backdrop-blur-xl border-b border-neutral-200 shadow-sm sticky top-0 z-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-neutral-200" 
            :style="{ backgroundColor: colorPrincipal }">
            <BarChart3 class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Centro de Inteligencia
            </h1>
            <p class="text-sm text-neutral-500 font-medium flex items-center gap-2">
              <Zap class="w-3 h-3 text-amber-500" />
              Análisis de rendimiento y métricas operativas
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="loadAnalytics" 
            class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 bg-white shadow-sm active:scale-95"
            :disabled="cargando">
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
            <span class="text-sm font-semibold">Actualizar datos</span>
          </button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="flex gap-2 mt-6 p-1.5 bg-neutral-200/50 w-fit rounded-2xl">
        <button @click="activeTab = 'vivo'"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 bg-white hover-lift"
          :class="activeTab === 'vivo' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700'"
          :style="activeTab === 'vivo' ? 'background-color: rgb(var(--color-primary))' : ''">
          Panel en Vivo
        </button>
        <button @click="activeTab = 'historico'"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 bg-white hover-lift"
          :class="activeTab === 'historico' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700'"
          :style="activeTab === 'historico' ? 'background-color: rgb(var(--color-primary))' : ''">
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
          <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <DollarSign class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Ventas Hoy</span>
              </div>
              <span v-if="comparacionVentasHoy" 
                class="text-[10px] font-black px-2 py-1 rounded-md" 
                :class="comparacionVentasHoy > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ comparacionVentasHoy > 0 ? '↑' : '↓' }} {{ round(Math.abs(comparacionVentasHoy), 1) }}%
              </span>
            </div>
            <p class="text-3xl font-black text-neutral-900">${{ round(ventasHoy) }}</p>
            <p class="text-xs text-neutral-400 mt-2 font-medium">vs ayer: ${{ round(ventasAyer) }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Receipt class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tickets Hoy</span>
              </div>
              <span v-if="comparacionTickets" 
                class="text-[10px] font-black px-2 py-1 rounded-md" 
                :class="comparacionTickets > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ comparacionTickets > 0 ? '↑' : '↓' }} {{ round(Math.abs(comparacionTickets), 1) }}%
              </span>
            </div>
            <p class="text-3xl font-black text-neutral-900">{{ Math.round(ticketsHoy) }}</p>
            <p class="text-xs text-neutral-400 mt-2 font-medium">vs semana pasada: {{ Math.round(ticketsSemanaPasada) }}</p>
          </div>
  
          <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                <Package class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Productos</span>
            </div>
            <p class="text-3xl font-black text-neutral-900">{{ productosVendidos }}</p>
            <p class="text-xs text-neutral-400 mt-2 font-medium">Velocidad: {{ velocidadVentas }} / hora</p>
          </div>
  
          <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <TrendingUp class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Ganancia Neta</span>
            </div>
            <p class="text-3xl font-black text-emerald-600">${{ round(gananciaNeta) }}</p>
            <p class="text-xs text-neutral-400 mt-2 font-medium">Margen: {{ round(margenPorcentaje, 1) }}%</p>
          </div>
  
          <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <Calculator class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tkt Promedio</span>
            </div>
            <p class="text-3xl font-black text-neutral-900">${{ round(ticketPromedio) }}</p>
            <p class="text-xs text-neutral-400 mt-2 font-medium">Objetivo: ${{ round(ticketObjetivo || 150) }}</p>
          </div>
        </div>

        <!-- Gráficos en Vivo -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div class="lg:col-span-2 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="font-bold text-neutral-900 text-xl tracking-tight flex items-center gap-3">
                  <BarChart3 class="w-6 h-6 text-neutral-400" />
                  Tendencia de Ventas
                </h3>
                <p class="text-xs text-neutral-400 font-medium mt-1">Análisis de volumen de ingresos en los últimos periodos</p>
              </div>
              <div class="flex gap-1 p-1 bg-neutral-100 rounded-xl">
                <button @click="periodoVentas = '7'" 
                  class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 bg-white" 
                  :style="periodoVentas === '7' ? 'background-color: rgb(var(--color-primary))' : ''"
                  :class="periodoVentas === '7' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700'">
                  7 Días
                </button>
                <button @click="periodoVentas = '30'" 
                  class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 bg-white" 
                  :style="periodoVentas === '30' ? 'background-color: rgb(var(--color-primary))' : ''"
                  :class="periodoVentas === '30' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700'">
                  30 Días
                </button>
              </div>
            </div>
            <div class="h-80 w-full">
              <canvas id="salesChart"></canvas>
            </div>
          </div>
  
          <div class="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <Zap class="w-6 h-6 text-neutral-400" />
              <h3 class="font-bold text-neutral-900 text-xl tracking-tight">Ventas por Día</h3>
            </div>
            <div class="h-64 w-full">
              <canvas id="peakHoursChart"></canvas>
            </div>
            <div class="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Mejor día</p>
                <p class="text-sm font-bold text-emerald-900">{{ mejorDia }} • ${{ formatNumber(ventasMejorDia) }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Métodos de Pago + Top Productos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <CreditCard class="w-6 h-6 text-neutral-400" />
              <h3 class="font-bold text-neutral-900 text-xl tracking-tight">Distribución de Pagos</h3>
            </div>
            <div class="h-64 w-full flex items-center justify-center mb-8">
              <canvas id="paymentChart"></canvas>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="metodo in metodosPago" :key="metodo.metodo" 
                class="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" 
                    :style="{ backgroundColor: getMetodoColor(metodo.metodo), color: 'white' }">
                    <component :is="getMetodoIcon(metodo.metodo)" class="w-4 h-4" />
                  </div>
                  <span class="text-neutral-600 text-sm font-bold capitalize">{{ metodo.metodo }}</span>
                </div>
                <span class="font-black text-neutral-900 text-sm">${{ round(metodo.total) }}</span>
              </div>
            </div>
          </div>
  
          <div class="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 mb-8">
              <Award class="w-6 h-6 text-neutral-400" />
              <h3 class="font-bold text-neutral-900 text-xl tracking-tight">Productos Estrella</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(prod, index) in topProductos" :key="index" 
                class="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 group">
                <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-black text-neutral-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-neutral-900 truncate">{{ prod.nombre }}</p>
                  <p class="text-xs text-neutral-400 font-medium">{{ prod.cantidad }} unidades vendidas</p>
                </div>
                <div class="text-right">
                  <p class="font-black text-neutral-900 text-sm">${{ round(prod.total) }}</p>
                  <p class="text-[10px] font-bold text-neutral-400 uppercase">{{ prod.participacion }}% share</p>
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
                <p class="font-bold text-neutral-900">{{ prod.nombre }}</p>
                <p class="text-xs font-medium text-neutral-400 uppercase tracking-wider">{{ prod.categoria }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-red-600">{{ prod.stock }}</p>
                <p class="text-[10px] font-bold text-red-400 uppercase">mín: {{ prod.stock_minimo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ANÁLISIS HISTÓRICO -->
      <div v-if="activeTab === 'historico'" class="space-y-6">
        <!-- Selector de Fechas -->
        <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div class="flex flex-wrap items-end gap-4">
            <div>
              <label class="block text-xs font-semibold mb-2 text-neutral-500 uppercase tracking-wider">Fecha Inicio</label>
              <input
                type="date"
                v-model="fechaInicio"
                class="px-4 py-2 rounded-lg border bg-neutral-50 border-neutral-200 text-neutral-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-2 text-neutral-500 uppercase tracking-wider">Fecha Fin</label>
              <input
                type="date"
                v-model="fechaFin"
                class="px-4 py-2 rounded-lg border bg-neutral-50 border-neutral-200 text-neutral-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button @click="cargarReportes" class="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all">
              Generar Reporte
            </button>
            <div class="flex gap-2 ml-auto p-1 bg-neutral-100 rounded-lg">
              <button @click="setPeriodo('hoy')" class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                :class="periodoReporte === 'hoy' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700 bg-white'"
                :style="periodoReporte === 'hoy' ? 'background-color: rgb(var(--color-primary))' : ''">
                Hoy
              </button>
              <button @click="setPeriodo('semana')" class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                :class="periodoReporte === 'semana' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700 bg-white'"
                :style="periodoReporte === 'semana' ? 'background-color: rgb(var(--color-primary))' : ''">
                Semana
              </button>
              <button @click="setPeriodo('mes')" class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                :class="periodoReporte === 'mes' ? 'text-white shadow-sm scale-105' : 'text-neutral-500 hover:text-neutral-700 bg-white'"
                :style="periodoReporte === 'mes' ? 'background-color: rgb(var(--color-primary))' : ''">
                Mes
              </button>
            </div>
            <div class="flex gap-2">
              <button @click="exportarExcel" class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all">
                Excel
              </button>
              <button @click="exportarPDF" class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-all">
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
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <p class="text-xs font-medium text-neutral-500 mb-1">Total Ventas</p>
              <p class="text-xl font-bold text-neutral-900">${{ formatNumber(resumen.total_ventas) }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <p class="text-xs font-medium text-neutral-500 mb-1">Tickets</p>
              <p class="text-xl font-bold text-neutral-900">{{ resumen.num_tickets }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <p class="text-xs font-medium text-neutral-500 mb-1">Productos</p>
              <p class="text-xl font-bold text-neutral-900">{{ resumen.productos_vendidos }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <p class="text-xs font-medium text-neutral-500 mb-1">Ganancia</p>
              <p class="text-xl font-bold text-emerald-600">${{ formatNumber(resumen.ganancia_neta) }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <p class="text-xs font-medium text-neutral-500 mb-1">Tkt Promedio</p>
              <p class="text-xl font-bold text-neutral-900">${{ formatNumber(ticketPromedioReporte) }}</p>
            </div>
          </div>
  
          <!-- Gráficos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 class="font-bold mb-4 text-neutral-900">Ventas Diarias</h3>
              <div class="h-64">
                <Bar :data="chartData.daily" :options="chartOptions" />
              </div>
            </div>
  
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 class="font-bold mb-4 text-neutral-900">Métodos de Pago</h3>
              <div class="h-64">
                <Doughnut :data="chartData.metodos" :options="chartOptionsDoughnut" />
              </div>
            </div>
  
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 class="font-bold mb-4 text-neutral-900">Por Categoría</h3>
              <div class="h-64">
                <Pie :data="chartData.categorias" :options="chartOptionsDoughnut" />
              </div>
            </div>
  
            <!-- Top Productos -->
            <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 class="font-bold mb-4 text-neutral-900">Top Productos</h3>
              <div class="space-y-2 max-h-64 overflow-auto">
                <div v-for="(prod, i) in top_productos" :key="i" 
                  class="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                      {{ i + 1 }}
                    </span>
                    <span class="text-sm font-medium text-neutral-900">{{ prod.nombre }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-neutral-900 text-sm">${{ Number(prod.total).toFixed(2) }}</p>
                    <p class="text-xs text-neutral-400">{{ prod.cantidad }} uds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Stock Bajo -->
          <div v-if="stock_bajo.length" class="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
            <h3 class="font-bold mb-6 flex items-center gap-2 text-red-600 text-lg">
              Alertas de Stock Bajo
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="prod in stock_bajo" :key="prod.id" 
                class="p-4 rounded-xl flex items-center justify-between bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
                <div>
                  <p class="font-semibold text-neutral-900">{{ prod.nombre }}</p>
                  <p class="text-xs text-neutral-500">{{ prod.categoria }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-red-600">{{ prod.stock }}</p>
                  <p class="text-xs text-neutral-500">mín: {{ prod.stock_minimo }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <!-- Sin resultados -->
        <div v-else class="text-center py-12">
          <p class="text-neutral-500">Selecciona un rango de fechas para ver el reporte</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Bar, Doughnut, Pie } from 'vue-chartjs'
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Title, Tooltip, Legend, LineController, BarController, DoughnutController, PieController } from 'chart.js'
import axios from 'axios'
import { 
  Zap, BarChart3, DollarSign, Receipt, Package, TrendingUp, Calculator,
  CreditCard, Award, AlertTriangle, RotateCw, Banknote, ArrowLeftRight, Wallet,
  FileSpreadsheet, FileText, Send
} from 'lucide-vue-next'
import { config } from '@/stores/config'

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Title, Tooltip, Legend, LineController, BarController, DoughnutController, PieController)

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

// Notification state
const notification = ref(null)
let notificationTimeout = null

const showNotification = (message, type = 'error') => {
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notification.value = { message, type }
  notificationTimeout = setTimeout(() => {
    notification.value = null
  }, 4000)
}

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
const dayOfWeekStats = ref([])

// New metrics
const velocidadVentas = ref(0)
const mejorDia = ref('-')
const ventasMejorDia = ref(0)
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
const periodoVentas = ref('30')

// Reports section
const periodoReporte = ref('hoy')
const reportes = ref(null)
const resumen = ref({ total_ventas: 0, num_tickets: 0, productos_vendidos: 0, ganancia_neta: 0 })
const stock_bajo = ref([])
const top_productos = ref([])
const ticketPromedioReporte = computed(() => {
  const t = resumen.value?.num_tickets || 0
  return t > 0 ? resumen.value.total_ventas / t : 0
})
const chartData = ref({ daily: { labels: [], datasets: [] }, metodos: { labels: [], datasets: [] }, categorias: { labels: [], datasets: [] } })
const chartOptions = { responsive: true, maintainAspectRatio: false }
const chartOptionsDoughnut = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }

const setPeriodo = (periodo) => {
  periodoReporte.value = periodo
  const hoy = new Date()
  fechaFin.value = hoy.toISOString().split('T')[0]
  if (periodo === 'hoy') {
    fechaInicio.value = hoy.toISOString().split('T')[0]
  } else if (periodo === 'semana') {
    const inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - 7)
    fechaInicio.value = inicio.toISOString().split('T')[0]
  } else {
    const inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - 30)
    fechaInicio.value = inicio.toISOString().split('T')[0]
  }
}

const cargarReportes = async () => {
  cargando.value = true
  try {
    const { data } = await api.get('/ventas/reportes', {
      params: { fecha_inicio: fechaInicio.value, fecha_fin: fechaFin.value }
    })
    reportes.value = data
    resumen.value = data.resumen || { total_ventas: 0, num_tickets: 0, productos_vendidos: 0, ganancia_neta: 0 }
    stock_bajo.value = data.stock_bajo || []
    top_productos.value = data.top_productos || []
    const pc = colorPrincipal.value
    const palette = [pc, '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6']
    chartData.value = {
      daily: {
        labels: (data.ventas_diarias || []).map(d => d.fecha?.split('T')[0] || ''),
        datasets: [{
          label: 'Ventas',
          data: (data.ventas_diarias || []).map(d => d.total || 0),
          backgroundColor: pc + '80',
          borderColor: pc,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      metodos: {
        labels: (data.metodos || []).map(m => m.metodo),
        datasets: [{
          data: (data.metodos || []).map(m => m.total),
          backgroundColor: palette.slice(0, (data.metodos || []).length),
          borderWidth: 2
        }]
      },
      categorias: {
        labels: (data.categorias || []).map(c => c.categoria),
        datasets: [{
          data: (data.categorias || []).map(c => c.total),
          backgroundColor: palette.slice(0, (data.categorias || []).length),
          borderWidth: 2
        }]
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

const exportarExcel = () => {
  import('xlsx').then(XLSX => {
    const wb = XLSX.utils.book_new()
    const data = reportes.value
    if (!data) return

    const res = data.resumen || {}
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Reporte del ' + fechaInicio.value + ' al ' + fechaFin.value],
      [],
      ['Métrica', 'Valor'],
      ['Total Ventas', res.total_ventas || 0],
      ['Tickets', res.num_tickets || 0],
      ['Productos Vendidos', res.productos_vendidos || 0],
      ['Ganancia Neta', res.ganancia_neta || 0],
      ['Ticket Promedio', res.num_tickets > 0 ? (res.total_ventas / res.num_tickets) : 0]
    ]), 'Resumen')

    const diarias = data.ventas_diarias || []
    if (diarias.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Fecha', 'Ventas', 'Tickets'],
        ...diarias.map(d => [d.fecha, d.total || 0, d.tickets || 0])
      ]), 'Ventas Diarias')
    }

    const productos = data.top_productos || []
    if (productos.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Producto', 'Cantidad', 'Total'],
        ...productos.map(p => [p.nombre, p.cantidad || 0, p.total || 0])
      ]), 'Top Productos')
    }

    const categorias = data.categorias || []
    if (categorias.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Categoría', 'Total'],
        ...categorias.map(c => [c.categoria, c.total || 0])
      ]), 'Categorías')
    }

    const metodos = data.metodos || []
    if (metodos.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Método', 'Total', 'Cantidad'],
        ...metodos.map(m => [m.metodo, m.total || 0, m.cantidad || 0])
      ]), 'Métodos de Pago')
    }

    const stock = data.stock_bajo || []
    if (stock.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Producto', 'Stock Actual', 'Stock Mínimo'],
        ...stock.map(s => [s.nombre, s.stock, s.stock_minimo])
      ]), 'Stock Bajo')
    }

    XLSX.writeFile(wb, `reporte_${fechaInicio.value}_${fechaFin.value}.xlsx`)
  })
}

const exportarPDF = () => {
  const data = reportes.value
  if (!data) return
  const r = data.resumen || {}
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
  body { padding: 20px; color: #111; }
  h1 { font-size: 18px; margin-bottom: 5px; }
  .periodo { font-size: 12px; color: #666; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  th { background: #f3f4f6; text-align: left; padding: 8px; font-weight: 600; border: 1px solid #d1d5db; }
  td { padding: 6px 8px; border: 1px solid #d1d5db; }
  h2 { font-size: 14px; margin: 20px 0 8px; }
  @media print { body { padding: 10px; } }
</style></head><body>
<h1>Reporte de Ventas</h1>
<p class="periodo">${fechaInicio.value} — ${fechaFin.value}</p>
<h2>Resumen</h2>
<table><tr><th>Métrica</th><th>Valor</th></tr>
<tr><td>Total Ventas</td><td>$${formatNumber(r.total_ventas)}</td></tr>
<tr><td>Tickets</td><td>${r.num_tickets}</td></tr>
<tr><td>Productos</td><td>${r.productos_vendidos}</td></tr>
<tr><td>Ganancia Neta</td><td>$${formatNumber(r.ganancia_neta)}</td></tr>
<tr><td>Ticket Promedio</td><td>$${formatNumber(r.num_tickets > 0 ? r.total_ventas / r.num_tickets : 0)}</td></tr>
</table>`)
  const diarias = data.ventas_diarias || []
  if (diarias.length) {
    win.document.write(`<h2>Ventas Diarias</h2><table><tr><th>Fecha</th><th>Ventas</th><th>Tickets</th></tr>
${diarias.map(d => `<tr><td>${d.fecha}</td><td>$${formatNumber(d.total)}</td><td>${d.tickets}</td></tr>`).join('')}</table>`)
  }
  const prods = data.top_productos || []
  if (prods.length) {
    win.document.write(`<h2>Top Productos</h2><table><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
${prods.map(p => `<tr><td>${p.nombre}</td><td>${p.cantidad}</td><td>$${formatNumber(p.total)}</td></tr>`).join('')}</table>`)
  }
  const cats = data.categorias || []
  if (cats.length) {
    win.document.write(`<h2>Por Categoría</h2><table><tr><th>Categoría</th><th>Total</th></tr>
${cats.map(c => `<tr><td>${c.categoria}</td><td>$${formatNumber(c.total)}</td></tr>`).join('')}</table>`)
  }
  const mets = data.metodos || []
  if (mets.length) {
    win.document.write(`<h2>Métodos de Pago</h2><table><tr><th>Método</th><th>Total</th><th>Cantidad</th></tr>
${mets.map(m => `<tr><td>${m.metodo}</td><td>$${formatNumber(m.total)}</td><td>${m.cantidad}</td></tr>`).join('')}</table>`)
  }
  const stock = data.stock_bajo || []
  if (stock.length) {
    win.document.write(`<h2>Stock Bajo</h2><table><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr>
${stock.map(s => `<tr><td>${s.nombre}</td><td>${s.stock}</td><td>${s.stock_minimo}</td></tr>`).join('')}</table>`)
  }
  win.document.write('</body></html>')
  win.document.close()
  setTimeout(() => win.print(), 500)
}

const round = (num, decimals = 2) => {
  const n = Number(num)
  if (isNaN(n)) return 0
  return Math.round((n + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-MX').format(round(num))
}

const calcularVentasPorDia = () => {
  if (dailyStats.value.length === 0) {
    dayOfWeekStats.value = []
    return
  }
  
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const totales = [0, 0, 0, 0, 0, 0, 0]
  const conteo = [0, 0, 0, 0, 0, 0, 0]
  
  dailyStats.value.forEach(d => {
    const [year, month, day] = d.fecha.split('T')[0].split('-')
    const fecha = new Date(Number(year), Number(month) - 1, Number(day))
    const diaIdx = fecha.getDay()
    totales[diaIdx] += Number(d.total) || 0
    conteo[diaIdx]++
  })
  
  dayOfWeekStats.value = diasSemana.map((nombre, i) => ({
    dia: nombre,
    promedio: conteo[i] > 0 ? round(totales[i] / conteo[i]) : 0,
    total: round(totales[i])
  }))
  
  const mejor = dayOfWeekStats.value.reduce((max, d) => d.promedio > max.promedio ? d : max, dayOfWeekStats.value[0])
  mejorDia.value = mejor?.dia || '-'
  ventasMejorDia.value = mejor?.promedio || 0
}

let chartInstances = {}

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
    
    const { data: dash } = await api.get('/ventas/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    const { data: reporteSemana } = await api.get('/ventas/reportes', {
      params: {
        fecha_inicio: hace7Dias.toISOString().split('T')[0],
        fecha_fin: new Date().toISOString().split('T')[0]
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)
    const { data: reporteAyer } = await api.get('/ventas/reportes', {
      params: { 
        fecha_inicio: ayer.toISOString().split('T')[0], 
        fecha_fin: ayer.toISOString().split('T')[0] 
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Métricas Base
    const dashboardTotal = dash.resumen?.total || 0
    ventasHoy.value = dashboardTotal
    ticketsHoy.value = dash.resumen?.tickets || 0
    productosVendidos.value = dash.resumen?.productos_vendidos || 0
    gananciaNeta.value = dash.resumen?.ganancia_neta || 0
    
    // Distribución y Productos Estrella (Prioridad: Reporte Semanal -> Dashboard)
    const reportData = reporteSemana
    metodosPago.value = reportData?.metodos?.length > 0 ? reportData.metodos : (dash.metodos || [])
    
    const totalPeriodo = reportData?.resumen?.total_ventas || ventasHoy.value
    topProductos.value = (reportData?.top_productos?.length > 0 
      ? reportData.top_productos 
      : (dash.top_productos || [])).map((p) => {
        const totalNum = Number(p.total) || 0
        return {
          ...p,
          total: totalNum,
          participacion: totalPeriodo > 0 ? round((totalNum / totalPeriodo) * 100, 1) : 0
        }
      })
    
    categoriasVentas.value = reportData?.categorias?.length > 0 ? reportData.categorias : (dash.categorias || [])
    
    // Gráfico de Tendencia
    if (reporteSemana?.ventas_diarias?.length > 0) {
      dailyStats.value = reporteSemana.ventas_diarias
    } else if (dash.resumen?.total > 0) {
      dailyStats.value = [{ fecha: new Date().toISOString(), total: dash.resumen.total }]
    } else {
      dailyStats.value = []
    }
    
    calcularVentasPorDia()
    
    costoTotal.value = ventasHoy.value - gananciaNeta.value
    ventasAyer.value = reporteAyer?.resumen?.total_ventas || 0
    comparacionVentasHoy.value = ventasAyer.value > 0 
      ? ((ventasHoy.value - ventasAyer.value) / ventasAyer.value * 100).toFixed(1)
      : 0
    
    const ticketsSemana = reporteSemana?.resumen?.num_tickets || 0
    ticketsSemanaPasada.value = ticketsSemana
    comparacionTickets.value = ticketsSemana > 0
      ? (ticketsHoy.value - (ticketsSemana / 7)) / (ticketsSemana / 7) * 100
      : 0
    
    velocidadVentas.value = (ventasHoy.value / 12).toFixed(1)
    productosStockBajo.value = dash.stock_bajo || []
    ultimaActualizacion.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    
    await nextTick()
    initCharts()
  } catch (e) {
    console.error('Error loading analytics:', e)
  }
}

const getChartColors = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    textColor: isDark ? '#a3a3a3' : '#737373',
    gridColor: isDark ? '#404040' : '#e5e5e5',
    borderColor: isDark ? '#262626' : '#ffffff'
  }
}

const getMetodoColor = (metodo) => {
  const colors = {
    efectivo: '#22c55e',
    tarjeta: '#3b82f6',
    transferencia: '#8b5cf6',
    credito: '#f59e0b'
  }
  return colors[metodo?.toLowerCase()] || '#6b7280'
}

const getMetodoIcon = (metodo) => {
  const icons = {
    efectivo: Banknote,
    tarjeta: CreditCard,
    transferencia: ArrowLeftRight,
    credito: Wallet
  }
  return icons[metodo?.toLowerCase()] || CreditCard
}

const initCharts = () => {
  const primaryColor = colorPrincipal.value
  const colors = getChartColors()
  
  Object.values(chartInstances).forEach(chart => chart?.destroy())
  chartInstances = {}
  
  const salesCtx = document.getElementById('salesChart')
  if (salesCtx && dailyStats.value.length > 0) {
    chartInstances.sales = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: dailyStats.value.map(d => {
          const [year, month, day] = d.fecha.split('T')[0].split('-')
          const fecha = new Date(Number(year), Number(month) - 1, Number(day))
          return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        }),
        datasets: [{
          label: 'Ventas',
          data: dailyStats.value.map(d => d.total || 0),
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
  
  const paymentCtx = document.getElementById('paymentChart')
  if (paymentCtx) {
    chartInstances.payment = new Chart(paymentCtx, {
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
  
  const peakCtx = document.getElementById('peakHoursChart')
  if (peakCtx) {
    chartInstances.peak = new Chart(peakCtx, {
      type: 'bar',
      data: {
        labels: dayOfWeekStats.value.map(d => d.dia),
        datasets: [{
          label: 'Ventas promedio',
          data: dayOfWeekStats.value.map(d => d.promedio),
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

onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>