<template>
  <div class="h-full flex flex-col">
    <header class="bg-white border-b border-surface-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-surface-900">Inventario</h1>
        <div class="flex items-center gap-3">
          <select v-model="filtro" class="px-4 py-2 border border-surface-200 rounded-xl">
            <option value="todos">Todos</option>
            <option value="bajo">Stock Bajo</option>
            <option value="agotado">Agotados</option>
          </select>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Total Productos</p>
          <p class="text-3xl font-bold text-surface-900">{{ totalProductos }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Stock Bajo</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stockBajo }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <p class="text-sm text-surface-500 mb-1">Agotados</p>
          <p class="text-3xl font-bold text-red-600">{{ stockAgotado }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-surface-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-surface-500">Producto</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-surface-500">Stock Actual</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-surface-500">Stock Mínimo</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-surface-500">Estado</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-surface-500">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="producto in inventarioFiltrado" :key="producto.id" class="hover:bg-surface-50">
              <td class="px-6 py-4">
                <p class="font-medium text-surface-900">{{ producto.nombre }}</p>
                <p class="text-sm text-surface-500">{{ producto.codigo_barras }}</p>
              </td>
              <td class="px-6 py-4 text-right font-semibold">{{ producto.stock }}</td>
              <td class="px-6 py-4 text-right text-surface-500">{{ producto.stock_minimo }}</td>
              <td class="px-6 py-4 text-center">
                <span v-if="producto.stock === 0" class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Agotado</span>
                <span v-else-if="producto.stock <= producto.stock_minimo" class="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">Bajo</span>
                <span v-else class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Normal</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button @click="abrirModal(producto)" class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700">
                  Ajustar
                </button>
              </td>
            </tr>
            <tr v-if="inventarioFiltrado.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-surface-400">
                Sin productos con stock bajo
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="cerrarModal">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold text-surface-900 mb-4">Ajustar Stock</h3>
        
        <div class="mb-4">
          <p class="font-medium text-surface-700">{{ productoSeleccionado?.nombre }}</p>
          <p class="text-sm text-surface-500">Stock actual: {{ productoSeleccionado?.stock }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Tipo de operación</label>
            <div class="flex gap-2">
              <button
                @click="tipoOperacion = 'entrada'"
                class="flex-1 py-3 border-2 rounded-xl text-center font-medium transition-colors"
                :class="tipoOperacion === 'entrada' ? 'border-green-500 bg-green-50 text-green-600' : 'border-surface-200 text-surface-600'"
              >
                Entrada (+)
              </button>
              <button
                @click="tipoOperacion = 'salida'"
                class="flex-1 py-3 border-2 rounded-xl text-center font-medium transition-colors"
                :class="tipoOperacion === 'salida' ? 'border-red-500 bg-red-50 text-red-600' : 'border-surface-200 text-surface-600'"
              >
                Salida (-)
              </button>
              <button
                @click="tipoOperacion = 'ajuste'"
                class="flex-1 py-3 border-2 rounded-xl text-center font-medium transition-colors"
                :class="tipoOperacion === 'ajuste' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-surface-200 text-surface-600'"
              >
                Ajuste (=)
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Cantidad</label>
            <input
              v-model.number="cantidadAjuste"
              type="number"
              min="0"
              class="w-full px-4 py-3 border border-surface-200 rounded-xl"
              :placeholder="tipoOperacion === 'ajuste' ? 'Stock nuevo' : 'Cantidad a agregar/quitar'"
            />
          </div>

          <div v-if="tipoOperacion !== 'ajuste'" class="p-4 bg-surface-50 rounded-xl">
            <p class="text-sm text-surface-600">
              Nuevo stock: 
              <span class="font-bold">
                {{ tipoOperacion === 'entrada' ? (productoSeleccionado?.stock || 0) + cantidadAjuste : (productoSeleccionado?.stock || 0) - cantidadAjuste }}
              </span>
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="cerrarModal" class="flex-1 py-3 border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50">
            Cancelar
          </button>
          <button @click="guardarStock" class="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl">
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'

const productosStore = useProductosStore()

const filtro = ref('todos')
const mostrarModal = ref(false)
const productoSeleccionado = ref(null)
const tipoOperacion = ref('entrada')
const cantidadAjuste = ref(0)

const inventarioFiltrado = computed(() => {
  let productos = productosStore.productos
  
  if (filtro.value === 'bajo') {
    productos = productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo)
  } else if (filtro.value === 'agotado') {
    productos = productos.filter(p => p.stock === 0)
  }
  
  return productos
})

const totalProductos = computed(() => productosStore.totalProductos)
const stockBajo = computed(() => productosStore.stockBajo.length)
const stockAgotado = computed(() => productosStore.productos.filter(p => p.stock === 0).length)

const abrirModal = (producto) => {
  productoSeleccionado.value = producto
  tipoOperacion.value = 'entrada'
  cantidadAjuste.value = 0
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  productoSeleccionado.value = null
}

const guardarStock = async () => {
  if (!cantidadAjuste.value || cantidadAjuste.value <= 0) return
  
  const result = await productosStore.ajustarStock(
    productoSeleccionado.value.id,
    cantidadAjuste.value,
    tipoOperacion.value
  )
  
  if (result.success) {
    cerrarModal()
    await productosStore.fetchProductos()
  }
}

onMounted(() => {
  productosStore.fetchProductos()
})
</script>