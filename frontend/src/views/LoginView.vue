<template>
  <div class="min-h-screen flex">
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-800 via-surface-900 to-black relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjIiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjMwIiByPSIyIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      <div class="relative z-10 flex flex-col justify-center px-12 lg:px-20">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <span class="text-2xl font-bold text-white">POS</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          Sistema de<br>Punto de Venta
        </h1>
        <p class="text-surface-400 text-lg max-w-md">
          Gestiona tu negocio de manera eficiente con herramientas modernas de venta e inventario.
        </p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <span class="text-xl font-bold text-surface-900">POS</span>
        </div>

        <h2 class="text-2xl font-bold text-surface-900 mb-2">Bienvenido de nuevo</h2>
        <p class="text-surface-500 mb-8">Ingresa tus credenciales para acceder</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="correo@ejemplo.com"
              class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div v-if="error" class="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <p class="mt-8 text-center text-surface-500">
          ¿No tienes cuenta?
          <button @click="showRegister = true" class="text-primary-500 hover:text-primary-600 font-medium ml-1">
            Regístrate
          </button>
        </p>
      </div>
    </div>

    <div v-if="showRegister" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showRegister = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-surface-900">Crear Cuenta</h3>
          <button @click="showRegister = false" class="text-surface-400 hover:text-surface-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Nombre</label>
            <input v-model="registerForm.nombre" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Correo</label>
            <input v-model="registerForm.email" type="email" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Contraseña</label>
            <input v-model="registerForm.password" type="password" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <button type="submit" :disabled="loading" class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl disabled:opacity-50">
            Crear Cuenta
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  nombre: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showRegister = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(form.email, form.password)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.register(registerForm)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>