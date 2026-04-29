import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { applyThemeColor } from './stores/config'

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