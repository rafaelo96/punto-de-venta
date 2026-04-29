import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { applyThemeColor } from './stores/config'
import { initDB } from './utils/offlineDB'

const app = createApp(App)
app.use(createPinia())
app.use(router)

const savedColor = localStorage.getItem('color_principal')
if (savedColor) {
  applyThemeColor(savedColor)
}

const savedDark = localStorage.getItem('dark_mode')
if (savedDark === 'true') {
  document.documentElement.classList.add('dark')
}

// Initialize IndexedDB for offline mode
initDB().then(() => {
  console.log('Offline DB ready')
}).catch(err => {
  console.error('Failed to init offline DB:', err)
})

// Online/Offline detection
window.addEventListener('online', () => {
  console.log('Back online - syncing pending data...')
  // Trigger sync of pending sales
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_PENDING_SALES'
    })
  }
})

window.addEventListener('offline', () => {
  console.log('Gone offline - switching to offline mode')
})

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        if (confirm('Hay una nueva versión disponible. ¿Recargar?')) {
          location.reload()
        }
      },
      onOfflineReady() {
        console.log('Aplicación lista para funcionar offline')
      },
      onRegistered(registration) {
        console.log('SW registrado:', registration)
        // Listen for messages from SW
        if (registration && registration.active) {
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SYNC_COMPLETE') {
              console.log('Sync completed:', event.data.result)
            }
          })
        }
      },
      onRegisterError(error) {
        console.error('Error al registrar SW:', error)
      }
    })
  }).catch(() => {
    console.log('PWA plugin no disponible en modo desarrollo')
  })
}

app.mount('#app')