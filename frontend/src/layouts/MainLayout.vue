<template>
  <div class="flex flex-col h-screen overflow-hidden transition-colors duration-300 bg-[rgb(var(--surface-50))]">
    <!-- Mobile Header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 transition-colors duration-300 glass border-b border-[rgb(var(--neutral-200))]">
      <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg transition-all hover-lift text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--surface-200))]">
        <Menu class="w-6 h-6" />
      </button>
      <div class="flex items-center gap-3">
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-md"
          :style="{ backgroundColor: 'rgb(var(--color-primary))' }"
        >
          <img v-if="negocioLogo" :src="negocioLogo" class="w-full h-full object-contain" />
          <ShoppingCart v-else class="w-5 h-5 text-white" />
        </div>
        <span class="font-semibold text-base tracking-wider text-[rgb(var(--neutral-900))]">{{ negocioNombre }}</span>
      </div>
      <button @click="logout" class="p-2.5 rounded-lg transition-all duration-300 hover-lift" 
        :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }"
      >
        <LogOut class="w-5 h-5" />
      </button>
    </header>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="lg:hidden fixed inset-0 bg-black/60 z-40"
      @click="sidebarOpen = false"
    ></div>
    
    <!-- Sidebar -->
    <aside 
      class="lg:hidden fixed left-0 top-14 bottom-0 w-64 flex flex-col z-50 transition-transform transition-colors duration-300 glass border-r border-[rgb(var(--neutral-200))]"
      :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <nav class="flex-1 p-4 space-y-2">
        <router-link
          v-for="(item, index) in menuItems"
          :key="item.path"
          :to="item.path"
          @click="sidebarOpen = false"
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover-lift"
          :class="isActive(item.path) ? 'shadow-lg' : 'text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--surface-200))] hover:text-[rgb(var(--neutral-900))]'"
          :style="isActive(item.path) ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>
    
    <!-- Desktop Sidebar (fixed) -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-20 xl:w-64 flex flex-col z-30 transition-colors duration-300 glass border-r border-[rgb(var(--neutral-200))]">
      <!-- Logo -->
      <div class="p-4 border-b border-[rgb(var(--neutral-200))] transition-colors duration-300">
        <div class="flex items-center justify-center xl:justify-start gap-4">
          <div 
            class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105"
            :style="{ backgroundColor: 'rgb(var(--color-primary))' }"
          >
            <img v-if="negocioLogo" :src="negocioLogo + '?t=' + Date.now()" class="w-full h-full object-contain" />
            <ShoppingCart v-else class="w-6 h-6 text-white" />
          </div>
          <span class="hidden xl:block text-xl font-bold tracking-wider transition-colors duration-300 text-[rgb(var(--neutral-900))]">{{ negocioNombre }}</span>
        </div>
      </div>
      
      <!-- Navegación -->
      <nav class="flex-1 p-2 xl:p-4 space-y-2 overflow-y-auto">
        <router-link
          v-for="(item, index) in menuItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-4 px-3 xl:px-4 py-3 rounded-xl transition-all duration-300 hover-lift"
          :class="isActive(item.path) ? 'shadow-lg' : 'text-[rgb(var(--neutral-500))] hover:bg-[rgb(var(--surface-200))] hover:text-[rgb(var(--neutral-900))]'"
          :style="isActive(item.path) ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
        >
          <div 
            class="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
            :class="isActive(item.path) ? 'bg-white/10' : 'bg-[rgb(var(--surface-200))] group-hover:bg-[rgb(var(--surface-300))]'"
          >
            <component :is="item.icon" class="w-6 h-6" :class="isActive(item.path) ? 'text-white' : ''" />
          </div>
          <span class="hidden xl:block font-medium transition-colors duration-300" :class="isActive(item.path) ? 'text-white' : ''">{{ item.name }}</span>
        </router-link>
      </nav>
      
      <!-- Usuario -->
      <div class="p-3 xl:p-4 border-t border-[rgb(var(--neutral-200))] transition-colors duration-300">
        <div class="flex items-center justify-center xl:justify-start gap-4">
          <div 
            class="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl"
            :style="{ backgroundColor: 'rgb(var(--color-primary))' }"
          >
            {{ userInitials }}
          </div>
          <div class="hidden xl:flex flex-col min-w-0">
            <p class="text-sm font-medium truncate text-[rgb(var(--neutral-900))]">{{ userName }}</p>
            <p class="text-xs capitalize text-[rgb(var(--neutral-500))]">{{ userRole }}</p>
          </div>
          <button @click="logout" class="p-2.5 rounded-lg transition-all duration-300 hover-lift" 
          :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }"
        >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
    
    <!-- Contenido Principal -->
    <main class="pt-14 lg:pt-0 lg:ml-20 xl:ml-64 h-full flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchConfig, config } from '@/stores/config'
import { ShoppingCart, LayoutGrid, Package, BarChart3, Settings, LogOut, Warehouse, TrendingUp, Wrench, Menu, History, FileText } from 'lucide-vue-next'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const isDark = ref(document.documentElement.classList.contains('dark'))

watch(() => route.path, () => {
  sidebarOpen.value = false
})

const negocioNombre = computed(() => config.nombre_negocio || authStore.negocio?.nombre || 'POS')
const logoCache = ref(0)
const negocioLogo = computed(() => {
  const logo = config.logo_negocio || authStore.negocio?.logo || ''
  if (logo) {
    const url = logo.startsWith('http') ? logo : API_URL + logo
    return url + (url.includes('?') ? '&' : '?') + 't=' + logoCache.value
  }
  return logo
})

const negocioColor = computed(() => config.color_principal || '#3b82f6')

const menuItems = [
  { name: 'Venta', path: '/', icon: ShoppingCart },
  { name: 'Productos', path: '/productos', icon: Package },
  { name: 'Inventario', path: '/inventario', icon: Warehouse },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Reportes', path: '/reportes', icon: FileText },
  { name: 'Historial', path: '/historial', icon: History },
  { name: 'Ajustes', path: '/ajustes', icon: Wrench }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const userName = computed(() => authStore.user?.nombre || 'Usuario')
const userRole = computed(() => authStore.user?.rol || 'usuario')
const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchConfig()
})

watch(() => config.logo_negocio, () => {
  logoCache.value = Date.now()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>