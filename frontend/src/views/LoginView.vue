<template>
  <div class="min-h-screen flex">
    <!-- Panel Izquierdo - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-900 via-surface-800 to-black relative overflow-hidden">
      <!-- Fondo animado -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent_40%)]"></div>
      </div>
      
      <!-- Formas flotantes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-12 lg:px-16">
        <div class="flex items-center gap-4 mb-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-bounce">
            <ShoppingCart class="w-8 h-8 text-white" />
          </div>
          <span class="text-3xl font-bold text-white tracking-wide">POS</span>
        </div>
        
        <h1 class="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Gestión<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Inteligente</span>
        </h1>
        <p class="text-surface-400 text-lg max-w-md leading-relaxed">
          Optimiza tus ventas, controla tu inventario y haz crecer tu negocio con herramientas diseñadas para ti.
        </p>

        <!-- Features -->
        <div class="mt-12 grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3 text-surface-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap class="w-5 h-5 text-primary-400" />
            </div>
            <span class="text-sm">Rápido</span>
          </div>
          <div class="flex items-center gap-3 text-surface-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield class="w-5 h-5 text-primary-400" />
            </div>
            <span class="text-sm">Seguro</span>
          </div>
          <div class="flex items-center gap-3 text-surface-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <BarChart class="w-5 h-5 text-primary-400" />
            </div>
            <span class="text-sm">Analytics</span>
          </div>
          <div class="flex items-center gap-3 text-surface-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Smartphone class="w-5 h-5 text-primary-400" />
            </div>
            <span class="text-sm">Responsive</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho - Login -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white/50 backdrop-blur-sm">
      <div class="w-full max-w-md">
        <!-- Logo Mobile -->
        <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
            <ShoppingCart class="w-6 h-6 text-white" />
          </div>
          <span class="text-2xl font-bold text-surface-900">POS</span>
        </div>

        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" :style="{ backgroundColor: colorPrincipal + '20' }">
            <UserCircle class="w-8 h-8" :style="{ color: colorPrincipal }" />
          </div>
          <h2 class="text-3xl font-bold text-surface-900 mb-2">Bienvenido</h2>
          <p class="text-surface-500 flex items-center justify-center gap-2">
            <LogIn class="w-4 h-4" />
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              v-model="form.email"
              type="email"
              placeholder="correo@ejemplo.com"
              class="w-full pl-12 pr-4 py-4 bg-surface-50 border border-surface-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              :style="{ '--tw-ring-color': colorPrincipal }"
              required
            />
          </div>

          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full pl-12 pr-4 py-4 bg-surface-50 border border-surface-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              :style="{ '--tw-ring-color': colorPrincipal }"
              required
            />
          </div>

          <transition name="fade">
            <div v-if="error" class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0" />
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
          </transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 text-white font-semibold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :style="{ backgroundColor: colorPrincipal }"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" />
              Iniciando...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <LogIn class="w-5 h-5" />
              Iniciar Sesión
            </span>
          </button>
        </form>

        <p class="mt-8 text-center text-surface-500">
          ¿Primera vez?
          <button @click="showRegister = true" class="font-semibold ml-1 transition-colors hover:underline"
            :style="{ color: colorPrincipal }"
          >
            Crear cuenta
          </button>
        </p>
      </div>
    </div>

    <!-- Modal Registro -->
    <transition name="modal">
      <div v-if="showRegister" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showRegister = false">
        <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <UserPlus class="w-6 h-6" />
              Nueva Cuenta
            </h3>
            <button @click="showRegister = false" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                <User class="w-4 h-4" />
                Tu nombre
              </label>
              <input v-model="registerForm.nombre" type="text" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': colorPrincipal }" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                <Store class="w-4 h-4" />
                Nombre del negocio
              </label>
              <input v-model="registerForm.nombreNegocio" type="text" placeholder="Mi Tienda" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': colorPrincipal }" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                <Mail class="w-4 h-4" />
                Correo
              </label>
              <input v-model="registerForm.email" type="email" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': colorPrincipal }" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                <Lock class="w-4 h-4" />
                Contraseña
              </label>
              <input v-model="registerForm.password" type="password" class="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': colorPrincipal }" required />
            </div>
            <button type="submit" :disabled="loading" class="w-full py-4 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              :style="{ backgroundColor: colorPrincipal }"
            >
              <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
              <span v-else>
                {{ loading ? 'Creando...' : 'Crear Cuenta' }}
              </span>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/stores/config'
import { 
  ShoppingCart, Zap, Shield, BarChart, Smartphone, UserCircle,
  LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus, X, User, Store
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const form = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  nombre: '',
  nombreNegocio: '',
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
  
  const result = await authStore.register({
    nombre: registerForm.nombre,
    email: registerForm.email,
    password: registerForm.password,
    nombreNegocio: registerForm.nombreNegocio
  })
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>