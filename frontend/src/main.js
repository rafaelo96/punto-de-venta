import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { applyThemeColor } from './stores/config'
import { initDB } from './utils/offlineDB'

const APP_VERSION = __APP_VERSION__
const VERSION_STORAGE_KEY = 'vendi_pro_app_version'
const VERSION_RELOAD_KEY = `vendi_pro_reload_${APP_VERSION}`

document.documentElement.dataset.appVersion = APP_VERSION

const previousVersion = localStorage.getItem(VERSION_STORAGE_KEY)
if (previousVersion && previousVersion !== APP_VERSION && 'caches' in window) {
  caches.keys().then(keys => {
    return Promise.all(keys.filter(key => key.includes('vendi-pro')).map(key => caches.delete(key)))
  }).catch(err => {
    console.warn('No se pudieron limpiar caches antiguos:', err)
  })
}
localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION)

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
        if (!sessionStorage.getItem(VERSION_RELOAD_KEY)) {
          sessionStorage.setItem(VERSION_RELOAD_KEY, 'true')
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
