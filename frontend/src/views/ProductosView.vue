<template>
  <div class="h-full flex flex-col">
    <header class="bg-white border-b border-surface-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-surface-900">Productos</h1>
        <button
          @click="abrirModal()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Producto
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-surface-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-surface-500">Código</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-surface-500">Nombre</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-surface-500">Categoría</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-surface-500">Compra</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-surface-500">Venta</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-surface-500">Stock</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-surface-500">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="producto in productos" :key="producto.id" class="hover:bg-surface-50">
              <td class="px-6 py-4 text-sm text-surface-600">{{ producto.codigo_barras }}</td>
              <td class="px-6 py-4 font-medium text-surface-900">{{ producto.nombre }}</td>
              <td class="px-6 py-4 text-sm text-surface-600">{{ producto.categoria_nombre || '-' }}</td>
              <td class="px-6 py-4 text-sm text-surface-600 text-right">${{ Number(producto.precio_compra).toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-primary-600 text-right">${{ Number(producto.precio_venta).toFixed(2) }}</td>
              <td class="px-6 py-4 text-right">
                <span
                  class="inline-flex px-2 py-1 rounded-lg text-xs font-medium"
                  :class="producto.stock <= producto.stock_minimo ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
                >
                  {{ producto.stock }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="abrirModal(producto)" class="p-2 text-surface-400 hover:text-primary-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H15v-3.172a2 2 0 00-.586-1.414l-2.828-2.828z"/>
                    </svg>
                  </button>
                  <button @click="eliminarProducto(producto.id)" class="p-2 text-surface-400 hover:text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="productos.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-surface-400">
                No hay productos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="cerrarModal">
      <div class="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-surface-900">
            {{ modoEdicion ? 'Editar' : 'Nuevo' }} Producto
          </h3>
          <button @click="cerrarModal" class="text-surface-400 hover:text-surface-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarProducto" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Código de Barras</label>
              <input v-model="form.codigo_barras" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nombre *</label>
              <input v-model="form.nombre" type="text" required class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Categoría</label>
            <select v-model="form.categoria_id" class="w-full px-4 py-3 border border-surface-200 rounded-xl">
              <option value="">Seleccionar categoría</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Precio de Compra *</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                <input v-model.number="form.precio_compra" type="number" step="0.01" required class="w-full pl-8 pr-4 py-3 border border-surface-200 rounded-xl" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Precio de Venta *</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                <input v-model.number="form.precio_venta" type="number" step="0.01" required class="w-full pl-8 pr-4 py-3 border border-surface-200 rounded-xl" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Margen de Ganancia</label>
            <div class="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
              <input v-model.number="form.margen_personalizado" type="number" min="0" max="200" placeholder="0" class="w-24 px-3 py-2 border border-surface-200 rounded-lg text-center" />
              <span class="text-surface-600">%</span>
              <span class="text-surface-400">|</span>
              <button type="button" @click="calcularDesdePorcentaje" class="px-3 py-2 text-sm text-primary-600 hover:text-primary-700">
                Aplicar al precio de compra
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Stock Inicial</label>
              <input v-model.number="form.stock" type="number" min="0" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Stock Mínimo</label>
              <input v-model.number="form.stock_minimo" type="number" min="0" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="cerrarModal" class="px-6 py-3 border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50">
              Cancelar
            </button>
            <button type="submit" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'

const productosStore = useProductosStore()

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const productoId = ref(null)

const form = reactive({
  nombre: '',
  codigo_barras: '',
  categoria_id: '',
  precio_compra: 0,
  precio_venta: 0,
  margen_personalizado: 0,
  stock: 0,
  stock_minimo: 5
})

const productos = computed(() => productosStore.productos)
const categorias = computed(() => productosStore.categorias)

const abrirModal = (producto = null) => {
  if (producto) {
    modoEdicion.value = true
    productoId.value = producto.id
    form.nombre = producto.nombre
    form.codigo_barras = producto.codigo_barras || ''
    form.categoria_id = producto.categoria_id || ''
    form.precio_compra = producto.precio_compra || 0
    form.precio_venta = producto.precio_venta || 0
    form.stock = producto.stock || 0
    form.stock_minimo = producto.stock_minimo || 5
  } else {
    modoEdicion.value = false
    productoId.value = null
    Object.assign(form, {
      nombre: '',
      codigo_barras: '',
      categoria_id: '',
      precio_compra: 0,
      precio_venta: 0,
      margen_personalizado: 0,
      stock: 0,
      stock_minimo: 5
    })
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const calcularDesdePorcentaje = () => {
  if (form.margen_personalizado > 0 && form.precio_compra > 0) {
    form.precio_venta = form.precio_compra * (1 + form.margen_personalizado / 100)
  }
}

const guardarProducto = async () => {
  let result
  if (modoEdicion.value) {
    result = await productosStore.actualizarProducto(productoId.value, form)
  } else {
    result = await productosStore.crearProducto(form)
  }
  
  if (result.success) {
    cerrarModal()
  }
}

const eliminarProducto = async (id) => {
  if (confirm('¿Est��s seguro de eliminar este producto?')) {
    await productosStore.eliminarProducto(id)
  }
}

onMounted(() => {
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
})
</script>