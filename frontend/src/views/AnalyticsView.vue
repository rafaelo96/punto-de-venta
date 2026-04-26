<template>
  <div class="h-full flex flex-col">
    <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
          <TrendingUp class="w-5 h-5" :style="{ color: colorPrincipal }" />
        </div>
        <h1 class="text-xl font-bold text-surface-900">Analytics</h1>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Calculator class="w-5 h-5 text-orange-600" />
            </div>
            <span class="text-sm text-surface-500">Ticket Promedio</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">${{ ticketPromedio.toFixed(2) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-surface-400" />
            Ventas por Día
          </h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <div class="text-center">
              <BarChart2 class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de ventas por día</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Award class="w-5 h-5 text-surface-400" />
            Productos Más Vendidos
          </h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <div class="text-center">
              <Package class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Top 10 productos</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-surface-400" />
            Ventas por Método de Pago
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span class="flex items-center gap-2 text-surface-600">
                <Banknote class="w-4 h-4" />
                Efectivo
              </span>
              <span class="font-semibold">$0.00</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span class="flex items-center gap-2 text-surface-600">
                <CreditCard class="w-4 h-4" />
                Tarjeta
              </span>
              <span class="font-semibold">$0.00</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span class="flex items-center gap-2 text-surface-600">
                <Send class="w-4 h-4" />
                Transferencia
              </span>
              <span class="font-semibold">$0.00</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Tag class="w-5 h-5 text-surface-400" />
            Categorías Más Vendidas
          </h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <div class="text-center">
              <Tag class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Por categoría</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  TrendingUp, DollarSign, Receipt, Package, Calculator,
  BarChart3, BarChart2, Award, CreditCard, Banknote, Send, Tag
} from 'lucide-vue-next'
import { config } from '@/stores/config'
import axios from 'axios'

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const ventasHoy = ref(0)
const ticketsHoy = ref(0)
const productosVendidos = ref(0)
const ticketPromedio = computed(() => ticketsHoy.value > 0 ? ventasHoy.value / ticketsHoy.value : 0)

onMounted(async () => {
  try {
    const token = localStorage.getItem('pos_token')
    const { data } = await axios.get('/api/ventas/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    ventasHoy.value = data.ventas_hoy || 0
    ticketsHoy.value = data.tickets_hoy || 0
    productosVendidos.value = data.productos_vendidos || 0
  } catch (e) {
    console.error(e)
  }
})
</script>