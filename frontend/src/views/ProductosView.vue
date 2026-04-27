<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
    <header class="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 px-8 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
            <Package class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Productos</h1>
            <p class="text-sm text-neutral-500"> Gestión del catálogo</p>
          </div>
        </div>
        <button 
          @click="showModal = true"
          class="px-5 py-3 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover-lift shadow-lg"
          :style="{ backgroundColor: `rgb(var(--color-primary))` }"
        >
          <Plus class="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <!-- Buscador -->
      <div class="relative mb-8">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 shadow-soft"
          :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
        />
      </div>

      <!-- Tabla -->
      <div class="section-container overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-50/80 border-b border-neutral-100">
            <tr>
              <th class="text-left px-6 py-4 text-sm font-medium text-neutral-500 flex items-center gap-2">
                <Package class="w-4 h-4" /> Producto
              </th>
              <th class="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                <Tag class="w-4 h-4 inline mr-1" />Categoría
              </th>
              <th class="text-right px-6 py-4 text-sm font-medium text-neutral-500">Stock</th>
              <th class="text-right px-6 py-4 text-sm font-medium text-neutral-500">Compra</th>
              <th class="text-right px-6 py-4 text-sm font-medium text-neutral-500">Venta</th>
              <th class="text-center px-6 py-4 text-sm font-medium text-neutral-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosFiltrados" :key="producto.id" class="border-b border-neutral-50 hover:bg-neutral-50/50 transition-all duration-300 hover-lift group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden shadow-inner">
                    <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
                    <Package v-else class="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-neutral-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-neutral-400">{{ producto.codigo_barras }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1.5 bg-neutral-100 rounded-xl text-sm text-neutral-600">{{ producto.categoria_nombre }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="producto.stock <= producto.stock_minimo ? 'text-red-600 font-bold' : 'text-neutral-900 font-semibold'">{{ producto.stock }}</span>
              </td>
              <td class="px-6 py-4 text-right text-neutral-600">${{ Number(producto.precio_compra).toFixed(2) }}</td>
              <td class="px-6 py-4 text-right font-bold text-neutral-900">${{ Number(producto.precio_venta).toFixed(2) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="editarProducto(producto)" class="p-2.5 rounded-xl transition-all duration-300 hover-lift" :style="{ color: `rgb(var(--color-primary))`, backgroundColor: `rgb(var(--color-primary))` + '20' }">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmarEliminar(producto)" class="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover-lift">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="productosFiltrados.length === 0" class="p-12 text-center text-neutral-400">
          <Package class="w-16 h-16 mx-auto mb-4 text-neutral-200" />
          <p class="text-lg font-medium text-neutral-500">No hay productos registrados</p>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <div v-if="showModal" class="fixed inset-0 bg-neutral-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="closeModal">
      <div class="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-scale-in relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-3" :style="{ backgroundColor: `rgb(var(--color-primary))` }"></div>
        
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
              <component :is="editando ? Pencil : Plus" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-black text-neutral-900 leading-tight">
                {{ editando ? 'Editar Producto' : 'Nuevo Producto' }}
              </h3>
              <p class="text-sm font-medium text-neutral-500 mt-1">
                {{ editando ? 'Modifica los detalles del producto' : 'Agrega un producto al catálogo' }}
              </p>
            </div>
          </div>
          <button @click="closeModal" class="p-3 rounded-xl transition-all duration-300 hover-lift"
            :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="guardarProducto" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-neutral-700 mb-2">Nombre del Producto</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Coca Cola 600ml" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" required />
          </div>
          
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Código de Barras</label>
              <input v-model="form.codigo_barras" type="text" placeholder="Opcional" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Categoría</label>
              <select v-model="form.categoria_id" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }">
                <option value="null" disabled>Selecciona una categoría...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Precio de Compra</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">$</span>
                <input v-model.number="form.precio_compra" type="number" step="0.01" class="w-full pl-10 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300 font-medium" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Precio de Venta</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">$</span>
                <input v-model.number="form.precio_venta" type="number" step="0.01" class="w-full pl-10 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300 font-medium" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Stock Disponible</label>
              <input v-model.number="form.stock" type="number" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300 font-medium" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2">Stock Mínimo (Alerta)</label>
              <input v-model.number="form.stock_minimo" type="number" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300 font-medium" :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-neutral-700 mb-2">Imagen del Producto</label>
            <div class="flex gap-4">
              <label class="w-36 h-28 flex-shrink-0 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl cursor-pointer transition-all group overflow-hidden relative">
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" ref="fileInput" />
                <div v-if="imagenPreview && !imagenUrlInput" class="w-full h-full relative">
                  <img :src="imagenPreview" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Pencil class="w-5 h-5 text-white" />
                  </div>
                  <button type="button" @click.stop="eliminarImagen" class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-10">
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="text-center text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  <Upload class="w-8 h-8 mx-auto mb-2" />
                  <span class="text-xs font-medium">Subir foto</span>
                </div>
              </label>
              <div class="flex-1 flex flex-col justify-center">
                <div class="relative">
                  <input 
                    v-model="imagenUrlInput" 
                    type="url" 
                    placeholder="O pega una URL de imagen válida..."
                    class="w-full px-5 py-3.5 pr-14 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all hover:border-neutral-300"
                    :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                  />
                  <button 
                    v-if="imagenUrlInput" 
                    type="button" 
                    @click="aplicarUrlImagen"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white rounded-xl shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-all hover:scale-105"
                    :style="{ color: `rgb(var(--color-primary))` }"
                  >
                    <Check class="w-5 h-5" />
                  </button>
                </div>
                <div v-if="imagenPreviewUrl" class="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-500 bg-neutral-100 w-max px-3 py-1.5 rounded-xl">
                  <Check class="w-4 h-4 text-green-500" /> {{ imagenUrlInput ? 'Enlazada' : 'Local' }}
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <button type="submit" class="w-full py-5 font-bold rounded-2xl transition-all duration-300 hover-lift flex items-center justify-center gap-3 text-lg shadow-xl" :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white', boxShadow: 'var(--shadow-depth-3)' }">
              <component :is="editando ? Pencil : Plus" class="w-6 h-6" />
              {{ editando ? 'Guardar Cambios' : 'Agregar Producto' }}
            </button>
          </div>
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