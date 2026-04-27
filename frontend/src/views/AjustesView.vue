<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
    <header class="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 px-8 py-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
          <Settings class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Ajustes</h1>
          <p class="text-sm text-neutral-500">Configuración del sistema</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Datos del Negocio -->
        <div class="section-container">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-semibold text-neutral-900 text-lg flex items-center gap-3">
              <Store class="w-6 h-6" :style="{ color: 'rgb(var(--color-primary))' }" />
              Datos del Negocio
            </h2>
            <span v-if="guardado" class="text-sm text-emerald-600 flex items-center gap-2">
              <Check class="w-4 h-4" />
              Guardado
            </span>
          </div>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Logo -->
              <div class="md:col-span-1">
                <div class="relative group">
                  <div 
                    class="w-36 h-36 mx-auto md:mx-0 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden transition-colors bg-neutral-50"
                    :style="{ borderColor: 'rgb(var(--color-primary))' }"
                  >
                    <img v-if="negocio.logo" :src="negocio.logo.startsWith('http') ? negocio.logo : API_URL + negocio.logo + '?t=' + Date.now()" class="w-full h-full object-contain" />
                    <Upload v-else class="w-10 h-10 text-neutral-400" />
                  </div>
                  <input type="file" accept="image/*" @change="subirLogo" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div class="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
                    <Plus class="w-5 h-5" />
                  </div>
                </div>
              </div>
                
              <!-- Nombre y Color -->
              <div class="md:col-span-2 space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Building2 class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                    Nombre del Negocio
                  </label>
                  <input 
                    v-model="negocio.nombre" 
                    type="text" 
                    class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
                    :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Palette class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                    Color Principal
                  </label>
                  <div class="flex items-center gap-4 flex-wrap">
                    <input 
                      type="color" 
                      v-model="negocio.color" 
                      class="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0 overflow-hidden shadow-lg"
                    />
                    <input 
                      type="text" 
                      v-model="negocio.color" 
                      class="w-32 px-4 py-3 border border-neutral-200 rounded-xl font-mono text-sm uppercase"
                    />
                    <button 
                      @click="aplicarColor" 
                      class="btn flex items-center gap-2 px-5 py-3"
                    >
                      <Check class="w-5 h-5" />
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dirección y Teléfono -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <MapPin class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                  Dirección
                </label>
                <textarea 
                  v-model="negocio.direccion" 
                  rows="2" 
                  class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
                  :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <Phone class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                  Teléfono
                </label>
                <input 
                  v-model="negocio.telefono" 
                  type="text" 
                  class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
                  :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
                />
              </div>
            </div>
            
            <button 
              @click="guardarNegocio" 
              class="btn flex items-center gap-3 px-6 py-4"
              :disabled="guardando"
            >
              <Save class="w-5 h-5" />
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>

        <!-- Categorías -->
        <div class="section-container">
          <h2 class="font-semibold text-neutral-900 text-lg mb-6 flex items-center gap-3">
            <Tag class="w-6 h-6" :style="{ color: 'rgb(var(--color-primary))' }" />
            Categorías
          </h2>
          <div class="space-y-3 mb-6">
            <div v-for="cat in categorias" :key="cat.id" class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl hover:bg-neutral-100/80 transition-all">
              <span class="font-medium flex items-center gap-3">
                <Folder class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                {{ cat.nombre }}
              </span>
              <button @click="eliminarCategoria(cat.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
            <p v-if="categorias.length === 0" class="text-neutral-500 text-sm flex items-center gap-2">
              <AlertCircle class="w-5 h-5" />
              No hay categorías
            </p>
          </div>
          <div class="flex gap-3">
            <input 
              v-model="nuevaCategoria" 
              type="text" 
              placeholder="Nueva categoría" 
              class="flex-1 px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
              @keyup.enter="agregarCategoria"
            />
            <button 
              @click="agregarCategoria" 
              class="btn flex items-center gap-2 px-5 py-3.5"
            >
              <Plus class="w-5 h-5" />
              Agregar
            </button>
          </div>
        </div>

        <!-- Preferencias -->
        <div class="section-container">
          <h2 class="font-semibold text-neutral-900 text-lg mb-6 flex items-center gap-3">
            <Sliders class="w-6 h-6" :style="{ color: 'rgb(var(--color-primary))' }" />
            Preferencias del Sistema
          </h2>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span class="flex items-center gap-3 text-neutral-700">
                <Receipt class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Emitir tickets automáticamente
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.emitir_ticket" 
                @change="guardarPreferencias" 
                class="w-6 h-6 rounded"
                :style="{ accentColor: 'rgb(var(--color-primary))' }"
              />
            </label>
            <label class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span class="flex items-center gap-3 text-neutral-700">
                <Volume2 class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Sonido al agregar producto
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.sonido" 
                @change="guardarPreferencias" 
                class="w-6 h-6 rounded"
                :style="{ accentColor: 'rgb(var(--color-primary))' }"
              />
            </label>
            <label class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span class="flex items-center gap-3 text-neutral-700">
                <Eye class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Mostrar stock en terminal
              </span>
              <input 
                type="checkbox" 
                v-model="preferencias.mostrar_stock" 
                @change="guardarPreferencias" 
                class="w-6 h-6 rounded"
                :style="{ accentColor: 'rgb(var(--color-primary))' }"
              />
            </label>
            <label class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span class="flex items-center gap-3 text-neutral-700">
                <LayoutGrid class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Vista por defecto (tarjetas)
              </span>
              <select 
                v-model="preferencias.vista" 
                @change="guardarPreferencias" 
                class="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm"
              >
                <option value="cards">Tarjetas</option>
                <option value="lista">Lista</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Modo Oscuro -->
        <div class="section-container">
          <h2 class="font-semibold text-neutral-900 text-lg mb-6 flex items-center gap-3">
            <Moon class="w-6 h-6" :style="{ color: 'rgb(var(--color-primary))' }" />
            Apariencia
          </h2>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-4 bg-neutral-50/80 rounded-xl cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span class="flex items-center gap-3 text-neutral-700">
                <Moon class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Modo Oscuro
              </span>
              <button
                @click="toggleDarkMode"
                class="relative w-14 h-8 rounded-full transition-colors"
                :class="darkMode ? 'bg-emerald-500' : 'bg-neutral-300'"
              >
                <span
                  class="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform flex items-center justify-center"
                  :class="darkMode ? 'translate-x-7' : 'translate-x-1'"
                >
                  <Moon v-if="darkMode" class="w-3.5 h-3.5 text-neutral-900" />
                  <Sun v-else class="w-3.5 h-3.5 text-amber-500" />
                </span>
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { applyThemeColor, config, saveConfig } from '@/stores/config'
import { 
  Settings, Store, Upload, Plus, Check, Save, Building2,
  Palette, MapPin, Phone, Tag, Folder, Trash2, AlertCircle,
  Sliders, Receipt, Volume2, Eye, LayoutGrid, Moon, Sun
} from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const colorPrincipal = computed(() => {
  if (negocio.color && negocio.color !== config.color_principal) return negocio.color
  const stored = localStorage.getItem('color_principal')
  if (stored) return stored
  return config.color_principal || '#3b82f6'
})

const negocio = reactive({ nombre: '', direccion: '', telefono: '', logo: '', color: '#3b82f6' })
const preferencias = reactive({ emitir_ticket: true, sonido: true, mostrar_stock: true, vista: 'cards' })
const categorias = ref([])
const nuevaCategoria = ref('')
const guardando = ref(false)
const guardado = ref(false)
const darkMode = ref(false)
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
    preferencias.vista = data.vista || 'cards'
    
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

const toggleDarkMode = async () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('dark_mode', darkMode.value)
  document.documentElement.classList.toggle('dark', darkMode.value)
  try {
    await api.put('/configuraciones', { dark_mode: darkMode.value.toString() })
  } catch (e) {
    console.error(e)
  }
}

const applyDarkMode = () => {
  const saved = localStorage.getItem('dark_mode')
  if (saved === 'true') {
    darkMode.value = true
    document.documentElement.classList.add('dark')
  } else if (saved === 'false') {
    darkMode.value = false
    document.documentElement.classList.remove('dark')
  }
}

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

onMounted(() => {
  applyDarkMode()
  fetchCategorias()
  fetchConfiguraciones()
})
</script>