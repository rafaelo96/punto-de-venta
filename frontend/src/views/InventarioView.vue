<template>
  <div class="h-full flex flex-col overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
    <header class="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 px-8 py-6 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
            <ClipboardList class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Inventario</h1>
            <p class="text-sm text-neutral-500">Gestión de productos y stock</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <AlertTriangle class="w-5 h-5 text-amber-500" />
          <span class="text-neutral-600">{{ stockBajo }} productos</span>
          <span class="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 font-semibold">Stock bajo</span>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div class="card-elevated p-6 hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner">
              <Package class="w-5 h-5 text-emerald-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Total</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900">{{ totalProductos }}</p>
        </div>

        <div class="card-elevated p-6 hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shadow-inner">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Stock bajo</span>
          </div>
          <p class="text-2xl font-bold text-red-600">{{ stockBajo }}</p>
        </div>

        <div class="card-elevated p-6 hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shadow-inner">
              <CheckCircle class="w-5 h-5 text-green-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Con stock</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ conStock }}</p>
        </div>

        <div class="card-elevated p-6 hover-lift">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center shadow-inner">
              <XCircle class="w-5 h-5 text-neutral-600" />
            </div>
            <span class="text-sm text-neutral-500 font-medium">Sin stock</span>
          </div>
          <p class="text-2xl font-bold text-neutral-600">{{ sinStock }}</p>
        </div>
      </div>

      <!-- Tabla -->
      <div class="section-container overflow-hidden">
        <div class="p-5 border-b border-neutral-100/50 flex items-center gap-3">
          <Table class="w-6 h-6 text-neutral-400" />
          <h2 class="font-semibold text-neutral-900 text-lg">Lista de Productos</h2>
        </div>
        <table class="w-full">
          <thead class="bg-neutral-50/80 border-b border-neutral-100">
            <tr class="divide-x divide-neutral-100">
              <th class="text-left px-5 py-4 text-sm font-medium text-neutral-500">
                <span class="flex items-center gap-2"><Package class="w-4 h-4" /> Producto</span>
              </th>
              <th class="text-left px-5 py-4 text-sm font-medium text-neutral-500">
                <span class="flex items-center gap-2"><Tag class="w-4 h-4" /> Categoría</span>
              </th>
              <th class="text-right px-5 py-4 text-sm font-medium text-neutral-500">
                <span class="flex items-center gap-2 justify-end"><Archive class="w-4 h-4" /> Stock</span>
              </th>
              <th class="text-right px-5 py-4 text-sm font-medium text-neutral-500">
                <span class="flex items-center gap-2 justify-end"><DollarSign class="w-4 h-4" /> Precio</span>
              </th>
              <th class="text-center px-5 py-4 text-sm font-medium text-neutral-500">
                <span class="flex items-center gap-2 justify-center"><Settings class="w-4 h-4" /> Acción</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productos" :key="producto.id" class="divide-x divide-neutral-50 hover:bg-neutral-50/50 transition-all duration-300 hover-lift group">
              <td class="px-5 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden shadow-inner">
                    <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
                    <Package v-else class="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-neutral-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-neutral-400 flex items-center gap-1">
                      <Barcode class="w-3 h-3" />
                      {{ producto.codigo_barras }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="px-3 py-1.5 bg-neutral-100 rounded-lg text-sm text-neutral-600 flex items-center gap-2 w-fit">
                  <Tag class="w-3 h-3" />
                  {{ producto.categoria_nombre }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <span 
                  class="px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 w-fit justify-end ml-auto"
                  :class="producto.stock <= producto.stock_minimo ? 'bg-red-100 text-red-600' : producto.stock === 0 ? 'bg-neutral-100 text-neutral-600' : 'bg-green-100 text-green-600'"
                >
                  <component :is="producto.stock === 0 ? XCircle : producto.stock <= producto.stock_minimo ? AlertTriangle : CheckCircle" class="w-3 h-3" />
                  {{ producto.stock }}
                </span>
              </td>
              <td class="px-5 py-4 text-right font-bold text-neutral-900">
                ${{ Number(producto.precio_venta).toFixed(2) }}
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    @click="ajustarStock(producto.id, 1, 'entrada')"
                    class="p-2.5 rounded-xl transition-all duration-300 hover-lift"
                    :style="{ backgroundColor: `rgb(var(--color-primary))`, color: 'white' }"
                    title="Entrada de stock"
                  >
                    <ArrowDownToLine class="w-4 h-4" />
                  </button>
                  <button 
                    @click="ajustarStock(producto.id, 1, 'salida')"
                    class="p-2.5 rounded-xl transition-all duration-300 hover-lift"
                    :style="{ backgroundColor: `rgb(var(--color-primary))`, color: 'white' }"
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