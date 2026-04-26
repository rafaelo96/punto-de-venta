<template>
  <div class="h-full flex flex-col">
    <header class="bg-white/80 backdrop-blur-sm border-b border-surface-200 px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
          <Settings class="w-5 h-5" :style="{ color: colorPrincipal }" />
        </div>
        <h1 class="text-xl font-bold text-surface-900">Ajustes</h1>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl space-y-6">
        <!-- Datos del Negocio -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-surface-900 flex items-center gap-2">
              <Store class="w-5 h-5 text-surface-400" />
              Datos del Negocio
            </h2>
            <span v-if="guardado" class="text-sm text-green-600 flex items-center gap-1">
              <Check class="w-4 h-4" />
              Guardado
            </span>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-start gap-6">
              <!-- Logo -->
              <div class="relative group">
                <div 
                  class="w-24 h-24 rounded-2xl border-2 border-dashed border-surface-300 flex items-center justify-center overflow-hidden transition-colors bg-surface-50"
                  :style="{ borderColor: colorPrincipal }"
                >
                  <img v-if="negocio.logo" :src="negocio.logo.startsWith('http') ? negocio.logo : API_URL + negocio.logo + '?t=' + Date.now()" class="w-full h-full object-contain" />
                  <Upload v-else class="w-8 h-8 text-surface-400" />
                </div>
                <input type="file" accept="image/*" @change="subirLogo" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div class="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  :style="{ backgroundColor: colorPrincipal }">
                  <Plus class="w-3 h-3" />
                </div>
              </div>
              
              <!-- Nombre y Color -->
              <div class="flex-1 space-y-3">
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                    <Building2 class="w-4 h-4 text-surface-400" />
                    Nombre del Negocio
                  </label>
                  <input 
                    v-model="negocio.nombre" 
                    type="text" 
                    class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
                    :style="{ '--tw-ring-color': colorPrincipal }"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                    <Palette class="w-4 h-4 text-surface-400" />
                    Color Principal
                  </label>
                  <div class="flex items-center gap-3">
                    <input 
                      type="color" 
                      v-model="negocio.color" 
                      class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
                    />
                    <input 
                      type="text" 
                      v-model="negocio.color" 
                      class="w-28 px-3 py-2 border border-surface-200 rounded-xl font-mono text-sm uppercase"
                    />
                    <button 
                      @click="aplicarColor" 
                      class="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2"
                      :style="{ backgroundColor: negocio.color }"
                    >
                      <Check class="w-4 h-4" />
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dirección y Teléfono -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-surface-400" />
                  Dirección
                </label>
                <textarea 
                  v-model="negocio.direccion" 
                  rows="2" 
                  class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
                  :style="{ '--tw-ring-color': colorPrincipal }"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                  <Phone class="w-4 h-4 text-surface-400" />
                  Teléfono
                </label>
                <input 
                  v-model="negocio.telefono" 
                  type="text" 
                  class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
                  :style="{ '--tw-ring-color': colorPrincipal }"
                />
              </div>
            </div>
            
            <button 
              @click="guardarNegocio" 
              class="px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              :style="{ backgroundColor: colorPrincipal }"
              :disabled="guardando"
            >
              <Save class="w-4 h-4" />
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>

        <!-- Categorías -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Tag class="w-5 h-5 text-surface-400" />
            Categorías
          </h2>
          <div class="space-y-2 mb-4">
            <div v-for="cat in categorias" :key="cat.id" class="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span class="font-medium flex items-center gap-2">
                <Folder class="w-4 h-4 text-surface-400" />
                {{ cat.nombre }}
              </span>
              <button @click="eliminarCategoria(cat.id)" class="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <p v-if="categorias.length === 0" class="text-surface-500 text-sm flex items-center gap-2">
              <AlertCircle class="w-4 h-4" />
              No hay categorías
            </p>
          </div>
          <div class="flex gap-2">
            <input 
              v-model="nuevaCategoria" 
              type="text" 
              placeholder="Nueva categoría" 
              class="flex-1 px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': colorPrincipal }"
              @keyup.enter="agregarCategoria"
            />
            <button 
              @click="agregarCategoria" 
              class="px-4 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 flex items-center gap-2"
              :style="{ backgroundColor: colorPrincipal }"
            >
              <Plus class="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        <!-- Preferencias -->
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Sliders class="w-5 h-5 text-surface-400" />
            Preferencias del Sistema
          </h2>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-3 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
              <span class="flex items-center gap-2 text-surface-700">
                <Receipt class="w-4 h-4" />
                Emitir tickets automáticamente
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.emitir_ticket" 
                @change="guardarPreferencias" 
                class="w-5 h-5 rounded"
                :style="{ accentColor: colorPrincipal }"
              />
            </label>
            <label class="flex items-center justify-between p-3 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
              <span class="flex items-center gap-2 text-surface-700">
                <Volume2 class="w-4 h-4" />
                Sonido al agregar producto
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.sonido" 
                @change="guardarPreferencias" 
                class="w-5 h-5 rounded"
                :style="{ accentColor: colorPrincipal }"
              />
            </label>
            <label class="flex items-center justify-between p-3 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
              <span class="flex items-center gap-2 text-surface-700">
                <Eye class="w-4 h-4" />
                Mostrar stock en terminal
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.mostrar_stock" 
                @change="guardarPreferencias" 
                class="w-5 h-5 rounded"
                :style="{ accentColor: colorPrincipal }"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { applyThemeColor, config, saveConfig } from '@/stores/config'
import { 
  Settings, Store, Upload, Plus, Check, Save, Building2,
  Palette, MapPin, Phone, Tag, Folder, Trash2, AlertCircle,
  Sliders, Receipt, Volume2, Eye
} from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const colorPrincipal = computed(() => {
  if (negocio.color && negocio.color !== config.color_principal) return negocio.color
  const stored = localStorage.getItem('color_principal')
  if (stored) return stored
  return config.color_principal || '#3b82f6'
})

const negocio = reactive({ nombre: '', direccion: '', telefono: '', logo: '', color: '#3b82f6' })
const preferencias = reactive({ emitir_ticket: true, sonido: true, mostrar_stock: true })
const categorias = ref([])
const nuevaCategoria = ref('')
const guardando = ref(false)
const guardado = ref(false)
const DEFAULT_COLOR = '#3b82f6'

const fetchConfiguraciones = async () => {
  try {
    const { data } = await api.get('/configuraciones')
    negocio.nombre = data.nombre_negocio || ''
    negocio.direccion = data.direccion_negocio || ''
    negocio.telefono = data.telefono_negocio || ''
    negocio.logo = data.logo_negocio || ''
    negocio.color = data.color_principal || DEFAULT_COLOR
    
    preferencias.emitir_ticket = data.emitir_ticket === 'true'
    preferencias.sonido = data.sonido === 'true'
    preferencias.mostrar_stock = data.mostrar_stock === 'true'
    
    applyThemeColor(negocio.color)
  } catch (e) {
    console.error(e)
  }
}

const guardarPreferencias = async () => {
  try {
    await api.put('/configuraciones', preferencias)
    mostrarGuardado()
  } catch (e) {
    console.error(e)
  }
}

const guardarNegocio = async () => {
  guardando.value = true
  try {
    await api.put('/configuraciones', {
      nombre_negocio: negocio.nombre,
      direccion_negocio: negocio.direccion,
      telefono_negocio: negocio.telefono,
      color_principal: negocio.color
    })
    applyThemeColor(negocio.color)
    mostrarGuardado()
  } catch (e) {
    console.error(e)
  } finally {
    guardando.value = false
  }
}

const aplicarColor = async () => {
  applyThemeColor(negocio.color)
  config.color_principal = negocio.color
  await guardarNegocio()
}

const mostrarGuardado = () => {
  guardado.value = true
  setTimeout(() => { guardado.value = false }, 2000)
}

const subirLogo = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.size > 2 * 1024 * 1024) {
    alert('El archivo no puede superar 2MB')
    return
  }
  
  const formData = new FormData()
  formData.append('logo', file)
  
  console.log('Subiendo logo:', file.name)
  
  try {
    const { data } = await api.post('/configuraciones/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log('Logo subido:', data)
    negocio.logo = data.path
    config.logo_negocio = data.path
    mostrarGuardado()
  } catch (e) {
    console.error('Error al subir logo:', e)
  }
}

const agregarCategoria = async () => {
  if (!nuevaCategoria.value.trim()) return
  try {
    await api.post('/categorias', { nombre: nuevaCategoria.value.trim() })
    nuevaCategoria.value = ''
    fetchCategorias()
  } catch (e) {
    console.error(e)
  }
}

const eliminarCategoria = async (id) => {
  if (confirm('¿Eliminar categoría?')) {
    await api.delete(`/categorias/${id}`)
    fetchCategorias()
  }
}

const fetchCategorias = async () => {
  try {
    const { data } = await api.get('/categorias')
    categorias.value = data
  } catch (e) {
    console.error(e)
  }
}

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

onMounted(() => {
  fetchCategorias()
  fetchConfiguraciones()
})
</script>