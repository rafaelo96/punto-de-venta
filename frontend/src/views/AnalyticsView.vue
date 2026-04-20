<template>
  <div class="h-full flex flex-col">
    <header class="bg-white border-b border-surface-200 px-6 py-4">
      <h1 class="text-xl font-bold text-surface-900">Analytics</h1>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Ventas Hoy</p>
          <p class="text-2xl font-bold text-surface-900">${{ ventasHoy.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Tickets Hoy</p>
          <p class="text-2xl font-bold text-surface-900">{{TicketsHoy}}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Productos Vendidos</p>
          <p class="text-2xl font-bold text-surface-900">{{ productosVendidos }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Ticket Promedio</p>
          <p class="text-2xl font-bold text-surface-900">${{ ticketPromedio.toFixed(2) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4">Ventas por Día</h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <p>Gráfico de ventas por día</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4">Productos Más Vendidos</h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <p>Top 10 productos</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4">Ventas por Método de Pago</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-surface-600">Efectivo</span>
              <span class="font-semibold">$0.00</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-surface-600">Tarjeta</span>
              <span class="font-semibold">$0.00</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-surface-600">Transferencia</span>
              <span class="font-semibold">$0.00</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h3 class="font-semibold text-surface-900 mb-4">Categorías Más Vendidas</h3>
          <div class="h-64 flex items-center justify-center text-surface-400">
            <p>Por categoría</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const ventasHoy = ref(0)
const ticketsHoy = ref(0)
const productosVendidos = ref(0)
const ticketPromedio = ref(0)

onMounted(() => {
  // Cargar datos del backend
})
</script>