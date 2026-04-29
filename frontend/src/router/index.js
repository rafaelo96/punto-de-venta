import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'venta',
        component: () => import('@/views/TerminalView.vue')
      },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('@/views/ProductosView.vue')
      },
      {
        path: 'inventario',
        name: 'inventario',
        component: () => import('@/views/InventarioView.vue')
      },
      {
        path: 'analisis',
        name: 'analisis',
        component: () => import('@/views/AnalisisView.vue'),
        meta: { title: 'Análisis' }
      },
      {
        path: 'historial',
        name: 'historial',
        component: () => import('@/views/HistorialView.vue')
      },
      {
        path: 'ajustes',
        name: 'ajustes',
        component: () => import('@/views/AjustesView.vue')
      },
      // Redirect old routes
      {
        path: 'analytics',
        redirect: '/analisis'
      },
      {
        path: 'reportes',
        redirect: '/analisis'
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router