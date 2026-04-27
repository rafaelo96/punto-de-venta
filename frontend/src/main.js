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

app.mount('#app')