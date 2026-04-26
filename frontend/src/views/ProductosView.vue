<template>
  <div class="h-full flex flex-col">
    <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
            <Package class="w-5 h-5" :style="{ color: colorPrincipal }" />
          </div>
          <h1 class="text-xl font-bold text-surface-900">Productos</h1>
        </div>
        <button 
          @click="showModal = true"
          class="px-4 py-2 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:opacity-90"
          :style="{ backgroundColor: colorPrincipal }"
        >
          <Plus class="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <!-- Buscador -->
      <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="w-full pl-10 pr-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
          :style="{ '--tw-ring-color': colorPrincipal }"
        />
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-surface-50 border-b border-surface-100">
            <tr>
              <th class="text-left px-6 py-4 text-sm font-medium text-surface-500 flex items-center gap-2">
                <Package class="w-4 h-4" /> Producto
              </th>
              <th class="text-left px-6 py-4 text-sm font-medium text-surface-500">
                <Tag class="w-4 h-4 inline mr-1" />Categoría
              </th>
              <th class="text-right px-6 py-4 text-sm font-medium text-surface-500">Stock</th>
              <th class="text-right px-6 py-4 text-sm font-medium text-surface-500">Compra</th>
              <th class="text-right px-6 py-4 text-sm font-medium text-surface-500">Venta</th>
              <th class="text-center px-6 py-4 text-sm font-medium text-surface-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosFiltrados" :key="producto.id" class="border-b border-surface-50 hover:bg-surface-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden">
                    <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
                    <Package v-else class="w-5 h-5 text-surface-400" />
                  </div>
                  <div>
                    <p class="font-medium text-surface-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-surface-400">{{ producto.codigo_barras }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-surface-100 rounded-lg text-xs text-surface-600">{{ producto.categoria_nombre }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="producto.stock <= producto.stock_minimo ? 'text-red-600' : 'text-surface-900'">{{ producto.stock }}</span>
              </td>
              <td class="px-6 py-4 text-right text-surface-600">${{ Number(producto.precio_compra).toFixed(2) }}</td>
              <td class="px-6 py-4 text-right font-medium text-surface-900">${{ Number(producto.precio_venta).toFixed(2) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="editarProducto(producto)" class="p-2 rounded-lg transition-colors hover:opacity-80" :style="{ color: colorPrincipal, backgroundColor: colorPrincipal + '20' }">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmarEliminar(producto)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="productosFiltrados.length === 0" class="p-8 text-center text-surface-400">
          <Package class="w-12 h-12 mx-auto mb-2" />
          <p>No hay productos registrados</p>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="closeModal">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-surface-900 flex items-center gap-2">
            <component :is="editando ? Pencil : Plus" class="w-5 h-5" />
            {{ editando ? 'Editar Producto' : 'Nuevo Producto' }}
          </h3>
          <button @click="closeModal" class="p-2 text-surface-400 hover:bg-surface-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="guardarProducto" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Nombre</label>
            <input v-model="form.nombre" type="text" class="w-full px-4 py-2 border border-surface-200 rounded-xl" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Código de Barras</label>
            <input v-model="form.codigo_barras" type="text" class="w-full px-4 py-2 border border-surface-200 rounded-xl" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Categoría</label>
            <select v-model="form.categoria_id" class="w-full px-4 py-2 border border-surface-200 rounded-xl">
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Precio Compra</label>
              <input v-model.number="form.precio_compra" type="number" step="0.01" class="w-full px-4 py-2 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Precio Venta</label>
              <input v-model.number="form.precio_venta" type="number" step="0.01" class="w-full px-4 py-2 border border-surface-200 rounded-xl" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Stock</label>
              <input v-model.number="form.stock" type="number" class="w-full px-4 py-2 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Stock Mínimo</label>
              <input v-model.number="form.stock_minimo" type="number" class="w-full px-4 py-2 border border-surface-200 rounded-xl" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Imagen</label>
            <div class="flex gap-2">
              <label class="flex-1 flex items-center justify-center h-24 border-2 border-dashed border-surface-200 hover:border-primary-400 rounded-xl cursor-pointer transition-colors">
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" ref="fileInput" />
                <div v-if="imagenPreview && !imagenUrlInput" class="w-full h-full relative">
                  <img :src="imagenPreview" class="w-full h-full object-contain rounded-xl" />
                  <button type="button" @click.stop="eliminarImagen" class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                    <X class="w-3 h-3" />
                  </button>
                </div>
                <div v-else class="text-center text-surface-400">
                  <Upload class="w-5 h-5 mx-auto mb-1" />
                  <span class="text-xs">Subir</span>
                </div>
              </label>
              <div class="flex-1 relative">
                <input 
                  v-model="imagenUrlInput" 
                  type="url" 
                  placeholder="O pega una URL de imagen"
                  class="w-full h-24 px-3 py-2 border border-surface-200 rounded-xl text-sm"
                />
                <button 
                  v-if="imagenUrlInput" 
                  type="button" 
                  @click="aplicarUrlImagen"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  :style="{ color: colorPrincipal }"
                >
                  <Check class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="imagenPreviewUrl" class="mt-2 flex items-center gap-2">
              <img :src="imagenPreviewUrl" class="h-16 object-contain rounded-lg border border-surface-200" />
              <span class="text-xs text-surface-500 flex-1">{{ imagenUrlInput ? 'URL' : 'Archivo local' }}</span>
            </div>
          </div>
          <button type="submit" class="w-full py-3 text-white font-medium rounded-xl" :style="{ backgroundColor: colorPrincipal }">
            {{ editando ? 'Actualizar' : 'Crear' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { Plus, Search, Package, Tag, Pencil, Trash2, X, Upload, Check } from 'lucide-vue-next'
import { config } from '@/stores/config'
import axios from 'axios'

const productosStore = useProductosStore()
const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const showModal = ref(false)
const editando = ref(false)
const productoId = ref(null)
const searchQuery = ref('')
const fileInput = ref(null)
const imagenFile = ref(null)
const imagenPreview = ref('')
const imagenPreviewUrl = ref('')
const imagenOriginal = ref('')
const imagenUrlInput = ref('')
const imagenEsUrl = ref(false)

const form = reactive({
  nombre: '',
  codigo_barras: '',
  categoria_id: null,
  precio_compra: 0,
  precio_venta: 0,
  stock: 0,
  stock_minimo: 5
})

const productosFiltrados = computed(() => {
  if (!searchQuery.value) return productosStore.productos
  const q = searchQuery.value.toLowerCase()
  return productosStore.productos.filter(p => 
    p.nombre.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q)
  )
})

const categorias = computed(() => productosStore.categorias)

const editarProducto = (producto) => {
  editando.value = true
  productoId.value = producto.id
  form.nombre = producto.nombre
  form.codigo_barras = producto.codigo_barras
  form.categoria_id = producto.categoria_id
  form.precio_compra = producto.precio_compra
  form.precio_venta = producto.precio_venta
  form.stock = producto.stock
  form.stock_minimo = producto.stock_minimo
  imagenOriginal.value = producto.imagen || ''
  imagenPreview.value = producto.imagen || ''
  imagenPreviewUrl.value = producto.imagen || ''
  imagenUrlInput.value = ''
  imagenEsUrl.value = producto.imagen?.startsWith('http') || false
  showModal.value = true
}

const confirmarEliminar = async (producto) => {
  if (confirm(`¿Eliminar "${producto.nombre}"?`)) {
    await productosStore.eliminarProducto(producto.id)
  }
}

const guardarProducto = async () => {
  const token = localStorage.getItem('pos_token')
  
  if (editando.value) {
    await productosStore.actualizarProducto(productoId.value, form)
    
    if (imagenFile.value) {
      await subirImagen(productoId.value)
    } else if (imagenEsUrl.value && imagenUrlInput.value) {
      await axios.put(`/api/productos/${productoId.value}/imagen`, { imagen: imagenUrlInput.value }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else if (!imagenPreviewUrl.value && imagenOriginal.value) {
      await axios.put(`/api/productos/${productoId.value}/imagen`, { imagen: null }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  } else {
    const nuevoProducto = await productosStore.crearProducto(form)
    
    if (imagenFile.value && nuevoProducto?.id) {
      await subirImagen(nuevoProducto.id)
    } else if (imagenEsUrl.value && imagenUrlInput.value && nuevoProducto?.id) {
      await axios.put(`/api/productos/${nuevoProducto.id}/imagen`, { imagen: imagenUrlInput.value }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }
  productosStore.fetchProductos()
  closeModal()
}

const closeModal = () => {
  showModal.value = false
  editando.value = false
  productoId.value = null
  form.nombre = ''
  form.codigo_barras = ''
  form.categoria_id = null
  form.precio_compra = 0
  form.precio_venta = 0
  form.stock = 0
  form.stock_minimo = 5
  imagenFile.value = null
  imagenPreview.value = ''
  imagenPreviewUrl.value = ''
  imagenOriginal.value = ''
  imagenUrlInput.value = ''
  imagenEsUrl.value = false
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  imagenFile.value = file
  imagenPreview.value = URL.createObjectURL(file)
  imagenPreviewUrl.value = URL.createObjectURL(file)
  imagenUrlInput.value = ''
  imagenEsUrl.value = false
}

const aplicarUrlImagen = () => {
  if (imagenUrlInput.value) {
    imagenPreviewUrl.value = imagenUrlInput.value
    imagenFile.value = null
    imagenEsUrl.value = true
  }
}

const eliminarImagen = () => {
  imagenFile.value = null
  imagenPreview.value = ''
  imagenPreviewUrl.value = ''
  imagenUrlInput.value = ''
  imagenEsUrl.value = false
  if (fileInput.value) fileInput.value.value = ''
}

const subirImagen = async (productoId) => {
  if (!imagenFile.value) return
  const formData = new FormData()
  formData.append('imagen', imagenFile.value)
  
  const token = localStorage.getItem('pos_token')
  await axios.post(`/api/productos/${productoId}/imagen`, formData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  productosStore.fetchProductos()
}

onMounted(() => {
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
})
</script>