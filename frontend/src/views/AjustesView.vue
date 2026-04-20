<template>
  <div class="h-full flex flex-col">
    <header class="bg-white border-b border-surface-200 px-6 py-4">
      <h1 class="text-xl font-bold text-surface-900">Ajustes</h1>
    </header>

    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4">Perfil de Usuario</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nombre</label>
              <input v-model="perfil.nombre" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Correo</label>
              <input v-model="perfil.email" type="email" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <button class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
              Guardar Cambios
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4">Categorías</h2>
          <div class="space-y-2 mb-4">
            <div v-for="cat in categorias" :key="cat.id" class="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span class="font-medium">{{ cat.nombre }}</span>
              <button @click="eliminarCategoria(cat.id)" class="text-red-500 hover:text-red-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input v-model="nuevaCategoria" type="text" placeholder="Nueva categoría" class="flex-1 px-4 py-3 border border-surface-200 rounded-xl" />
            <button @click="agregarCategoria" class="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
              Agregar
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4">Datos del Negocio</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nombre del Negocio</label>
              <input v-model="negocio.nombre" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Dirección</label>
              <textarea v-model="negocio.direccion" rows="2" class="w-full px-4 py-3 border border-surface-200 rounded-xl"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Teléfono</label>
              <input v-model="negocio.telefono" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl" />
            </div>
            <button class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
              Guardar
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h2 class="font-semibold text-surface-900 mb-4">Preferencias</h2>
          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <span class="text-surface-700">Emitir tickets automáticamente</span>
              <input type="checkbox" v-model="preferencias.emitir_ticket" class="w-5 h-5 rounded text-primary-500" />
            </label>
            <label class="flex items-center justify-between">
              <span class="text-surface-700">Sonido al agregar producto</span>
              <input type="checkbox" v-model="preferencias.sonido" class="w-5 h-5 rounded text-primary-500" />
            </label>
            <label class="flex items-center justify-between">
              <span class="text-surface-700">Mostrar stock en terminal</span>
              <input type="checkbox" v-model="preferencias.mostrar_stock" class="w-5 h-5 rounded text-primary-500" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const perfil = reactive({ nombre: '', email: '' })
const negocio = reactive({ nombre: '', direccion: '', telefono: '' })
const preferencias = reactive({ emitir_ticket: true, sonido: true, mostrar_stock: true })
const categorias = ref([])
const nuevaCategoria = ref('')

const agregarCategoria = async () => {
  if (!nuevaCategoria.value) return
  try {
    await axios.post('/api/categorias', { nombre: nuevaCategoria.value })
    nuevaCategoria.value = ''
    fetchCategorias()
  } catch (e) {
    console.error(e)
  }
}

const eliminarCategoria = async (id) => {
  if (confirm('¿Eliminar categoría?')) {
    await axios.delete(`/api/categorias/${id}`)
    fetchCategorias()
  }
}

const fetchCategorias = async () => {
  try {
    const { data } = await axios.get('/api/categorias')
    categorias.value = data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchCategorias()
})
</script>