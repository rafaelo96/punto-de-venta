<template>
  <div class="h-full flex flex-col overflow-hidden">
    <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 px-6 py-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
            <ClipboardList class="w-5 h-5" :style="{ color: colorPrincipal }" />
          </div>
          <h1 class="text-xl font-bold text-surface-900">Inventario</h1>
        </div>
        <div class="flex items-center gap-2 text-sm text-surface-500">
          <AlertTriangle class="w-4 h-4 text-yellow-500" />
          <span>{{ stockBajo }}</span>
          <span class="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 font-medium">Stock bajo</span>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Package class="w-5 h-5 text-primary-600" />
            </div>
            <span class="text-sm text-surface-500">Total</span>
          </div>
          <p class="text-2xl font-bold text-surface-900">{{ totalProductos }}</p>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            <span class="text-sm text-surface-500">Stock bajo</span>
          </div>
          <p class="text-2xl font-bold text-red-600">{{ stockBajo }}</p>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle class="w-5 h-5 text-green-600" />
            </div>
            <span class="text-sm text-surface-500">Con stock</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ conStock }}</p>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-surface-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <XCircle class="w-5 h-5 text-gray-600" />
            </div>
            <span class="text-sm text-surface-500">Sin stock</span>
          </div>
          <p class="text-2xl font-bold text-gray-600">{{ sinStock }}</p>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <div class="p-4 border-b border-surface-100 flex items-center gap-2">
          <Table class="w-5 h-5 text-surface-400" />
          <h2 class="font-semibold text-surface-900">Lista de Productos</h2>
        </div>
        <table class="w-full">
          <thead class="bg-surface-50 border-b border-surface-100">
            <tr class="divide-x divide-surface-100">
              <th class="text-left px-4 py-3 text-sm font-medium text-surface-500">
                <span class="flex items-center gap-2"><Package class="w-4 h-4" /> Producto</span>
              </th>
              <th class="text-left px-4 py-3 text-sm font-medium text-surface-500">
                <span class="flex items-center gap-2"><Tag class="w-4 h-4" /> Categoría</span>
              </th>
              <th class="text-right px-4 py-3 text-sm font-medium text-surface-500">
                <span class="flex items-center gap-2 justify-end"><Archive class="w-4 h-4" /> Stock</span>
              </th>
              <th class="text-right px-4 py-3 text-sm font-medium text-surface-500">
                <span class="flex items-center gap-2 justify-end"><DollarSign class="w-4 h-4" /> Precio</span>
              </th>
              <th class="text-center px-4 py-3 text-sm font-medium text-surface-500">
                <span class="flex items-center gap-2 justify-center"><Settings class="w-4 h-4" /> Acción</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productos" :key="producto.id" class="divide-x divide-surface-50 hover:bg-surface-50/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                    <Package class="w-5 h-5 text-surface-400" />
                  </div>
                  <div>
                    <p class="font-medium text-surface-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-surface-400 flex items-center gap-1">
                      <Barcode class="w-3 h-3" />
                      {{ producto.codigo_barras }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-surface-100 rounded-lg text-xs text-surface-600 flex items-center gap-1 w-fit">
                  <Tag class="w-3 h-3" />
                  {{ producto.categoria_nombre }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <span 
                  class="px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1 w-fit justify-end ml-auto"
                  :class="producto.stock <= producto.stock_minimo ? 'bg-red-100 text-red-600' : producto.stock === 0 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'"
                >
                  <component :is="producto.stock === 0 ? XCircle : producto.stock <= producto.stock_minimo ? AlertTriangle : CheckCircle" class="w-3 h-3" />
                  {{ producto.stock }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium text-surface-900">
                ${{ Number(producto.precio_venta).toFixed(2) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    @click="ajustarStock(producto.id, 1, 'entrada')"
                    class="p-2 rounded-lg transition-colors hover:opacity-80"
                    :style="{ backgroundColor: colorPrincipal + '20', color: colorPrincipal }"
                    title="Entrada de stock"
                  >
                    <ArrowDownToLine class="w-4 h-4" />
                  </button>
                  <button 
                    @click="ajustarStock(producto.id, 1, 'salida')"
                    class="p-2 rounded-lg transition-colors hover:opacity-80"
                    :style="{ backgroundColor: colorPrincipal + '20', color: colorPrincipal }"
                    title="Salida de stock"
                  >
                    <ArrowUpFromLine class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { 
  ClipboardList, Package, AlertTriangle, CheckCircle, XCircle,
  Tag, Archive, DollarSign, Settings, Barcode, Table,
  ArrowDownToLine, ArrowUpFromLine
} from 'lucide-vue-next'
import { config } from '@/stores/config'

const productosStore = useProductosStore()
const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const productos = computed(() => productosStore.productos)
const totalProductos = computed(() => productosStore.totalProductos)
const stockBajo = computed(() => productosStore.stockBajo.length)
const conStock = computed(() => productos.value.filter(p => p.stock > 0).length)
const sinStock = computed(() => productos.value.filter(p => p.stock === 0).length)

const ajustarStock = async (id, cantidad, tipo) => {
  await productosStore.ajustarStock(id, cantidad, tipo)
}

onMounted(() => {
  productosStore.fetchProductos()
})
</script>