<template>
  <div class="flex h-screen bg-gradient-to-br from-surface-50 to-surface-100">
    <!-- Sidebar -->
    <aside class="w-20 lg:w-64 bg-white/80 backdrop-blur-sm border-r border-white/50 flex flex-col shadow-lg">
      <!-- Logo -->
      <div class="p-4 border-b border-surface-100/50">
        <div class="flex items-center justify-center lg:justify-start gap-3">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg transition-transform hover:scale-105"
            :style="{ backgroundColor: negocioColor }"
          >
            <img v-if="negocioLogo" :src="negocioLogo" class="w-full h-full object-contain" />
            <ShoppingCart v-else class="w-6 h-6 text-white" />
          </div>
          <span class="hidden lg:block text-lg font-bold text-surface-900">{{ negocioNombre }}</span>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 p-2 lg:p-4 space-y-1">
        <router-link
          v-for="(item, index) in menuItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300"
          :class="[
            isActive(item.path) 
              ? 'text-white shadow-lg' 
              : 'text-surface-600 hover:bg-surface-50/80 hover:text-surface-900'
          ]"
          :style="isActive(item.path) ? { backgroundColor: negocioColor } : {}"
        >
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            :class="isActive(item.path) ? 'bg-white/20' : 'bg-surface-100 group-hover:bg-surface-200'"
          >
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span class="hidden lg:block font-medium">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- Usuario -->
      <div class="p-3 lg:p-4 border-t border-surface-100/50">
        <div class="flex items-center justify-center lg:justify-start gap-3">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
            :style="{ backgroundColor: negocioColor }"
          >
            {{ userInitials }}
          </div>
          <div class="hidden lg:flex flex-col min-w-0">
            <p class="text-sm font-medium text-surface-900 truncate">{{ userName }}</p>
            <p class="text-xs text-surface-500 capitalize">{{ userRole }}</p>
          </div>
          <button @click="logout" class="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Cerrar sesión">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchConfig, config } from '@/stores/config'
import { ShoppingCart, LayoutGrid, Package, BarChart3, Settings, LogOut, Warehouse, TrendingUp, Wrench } from 'lucide-vue-next'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const route = useRoute()
const authStore = useAuthStore()

const negocioNombre = computed(() => config.nombre_negocio || authStore.negocio?.nombre || 'POS')
const negocioLogo = computed(() => {
  const logo = config.logo_negocio || authStore.negocio?.logo || ''
  if (logo && !logo.startsWith('http')) {
    return API_URL + logo
  }
  return logo
})
const negocioColor = computed(() => config.color_principal || '#3b82f6')

const menuItems = [
  { name: 'Venta', path: '/', icon: ShoppingCart },
  { name: 'Productos', path: '/productos', icon: Package },
  { name: 'Inventario', path: '/inventario', icon: Warehouse },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
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