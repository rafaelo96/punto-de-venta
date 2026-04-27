<template>
  <div class="min-h-screen flex">
    <!-- Panel Izquierdo - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black relative overflow-hidden">
      <!-- Fondo animado -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent_40%)]"></div>
      </div>
      
      <!-- Formas flotantes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" :style="{ backgroundColor: 'rgb(var(--color-primary))' }" style="opacity: 0.1"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" :style="{ backgroundColor: 'rgb(var(--color-primary))' }" style="opacity: 0.05; animation-delay: 1s"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-12 lg:px-16">
        <div class="flex items-center gap-4 mb-10">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
            <ShoppingCart class="w-8 h-8 text-white" />
          </div>
          <span class="text-4xl font-bold text-white tracking-wide">POS</span>
        </div>
        
        <h1 class="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Gestión<br><span class="text-transparent bg-clip-text bg-gradient-to-r" :style="{ backgroundImage: 'linear-gradient(to right, rgb(var(--color-primary)), #fff)' }">Inteligente</span>
        </h1>
        <p class="text-neutral-400 text-lg max-w-md leading-relaxed">
          Optimiza tus ventas, controla tu inventario y haz crecer tu negocio con herramientas diseñadas para ti.
        </p>

        <!-- Features -->
        <div class="mt-12 grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3 text-neutral-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
            </div>
            <span class="text-sm">Rápido</span>
          </div>
          <div class="flex items-center gap-3 text-neutral-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
            </div>
            <span class="text-sm">Seguro</span>
          </div>
          <div class="flex items-center gap-3 text-neutral-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <BarChart class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
            </div>
            <span class="text-sm">Analytics</span>
          </div>
          <div class="flex items-center gap-3 text-neutral-300">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Smartphone class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
            </div>
            <span class="text-sm">Responsive</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho - Login -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div class="w-full max-w-md">
        <!-- Logo Mobile -->
        <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
            <ShoppingCart class="w-7 h-7 text-white" />
          </div>
          <span class="text-2xl font-bold text-neutral-900">POS</span>
        </div>

        <div class="text-center mb-8">
          <div class="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
            <UserCircle class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-3xl font-bold text-neutral-900 mb-2">Bienvenido</h2>
          <p class="text-neutral-500 flex items-center justify-center gap-2">
            <LogIn class="w-5 h-5" />
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              v-model="form.email"
              type="email"
              placeholder="correo@ejemplo.com"
              class="w-full pl-12 pr-5 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
              required
            />
          </div>

          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full pl-12 pr-5 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }"
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
            class="btn w-full py-5 flex items-center justify-center gap-3 text-lg"
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

        <p class="mt-8 text-center text-neutral-500">
          ¿Primera vez?
          <button @click="showRegister = true" class="font-semibold ml-1 transition-colors hover:underline"
            :style="{ color: 'rgb(var(--color-primary))' }"
          >
            Crear cuenta
          </button>
        </p>
      </div>
    </div>

    <!-- Modal Registro -->
    <transition name="modal">
      <div v-if="showRegister" class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showRegister = false">
        <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-neutral-900 flex items-center gap-3">
              <UserPlus class="w-6 h-6" :style="{ color: 'rgb(var(--color-primary))' }" />
              Nueva Cuenta
            </h3>
            <button @click="showRegister = false" class="p-2.5 text-neutral-400 hover:bg-neutral-100 rounded-xl transition-all hover-lift">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                <User class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Tu nombre
              </label>
              <input v-model="registerForm.nombre" type="text" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                <Store class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Nombre del negocio
              </label>
              <input v-model="registerForm.nombreNegocio" type="text" placeholder="Mi Tienda" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                <Mail class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Correo
              </label>
              <input v-model="registerForm.email" type="email" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                <Lock class="w-5 h-5" :style="{ color: 'rgb(var(--color-primary))' }" />
                Contraseña
              </label>
              <input v-model="registerForm.password" type="password" class="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 transition-all" :style="{ '--tw-ring-color': 'rgb(var(--color-primary))' }" required />
            </div>
            <button type="submit" :disabled="loading" class="btn w-full py-5 flex items-center justify-center gap-3"
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  ShoppingCart, Zap, Shield, BarChart, Smartphone, UserCircle,
  LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus, X, User, Store
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

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