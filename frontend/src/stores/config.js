import { reactive } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const config = reactive({
  emitir_ticket: true,
  sonido: true,
  mostrar_stock: true,
  vista: 'cards',
  nombre_negocio: '',
  direccion_negocio: '',
  telefono_negocio: '',
  logo_negocio: '',
  color_principal: '#3b82f6',
  negocio_id: null,
  negocio_slug: ''
})

const convertHexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '59 130 246'
}

export const applyThemeColor = (color) => {
  const rgb = convertHexToRgb(color)
  document.documentElement.style.setProperty('--color-primary', rgb)
  document.documentElement.style.setProperty('--color-primary-150', `${rgb.split(' ').map((c) => Math.max(0, parseInt(c) + 15)).join(' ')}`)
  document.documentElement.style.setProperty('--color-primary-500', rgb)
  
  const shades = [
    { name: '--color-primary-50', factor: 240 },
    { name: '--color-primary-100', factor: 224 },
    { name: '--color-primary-200', factor: 186 },
    { name: '--color-primary-300', factor: 125 },
    { name: '--color-primary-400', factor: 56 },
    { name: '--color-primary-600', factor: 2 },
    { name: '--color-primary-700', factor: 3 },
    { name: '--color-primary-800', factor: 7 },
    { name: '--color-primary-900', factor: 12 }
  ]
  
  shades.forEach(shade => {
    const r = Math.max(0, Math.min(255, parseInt(rgb.split(' ')[0]) + shade.factor - 100))
    const g = Math.max(0, Math.min(255, parseInt(rgb.split(' ')[1]) + shade.factor - 100))
    const b = Math.max(0, Math.min(255, parseInt(rgb.split(' ')[2]) + shade.factor - 100))
    document.documentElement.style.setProperty(shade.name, `${r} ${g} ${b}`)
  })
  
  localStorage.setItem('color_principal', color)
}

export const fetchConfig = async () => {
  try {
    const { data } = await api.get('/configuraciones')
    Object.assign(config, data)
    config.emitir_ticket = data.emitir_ticket === 'true'
    config.sonido = data.sonido === 'true'
    config.mostrar_stock = data.mostrar_stock === 'true'
    config.vista = data.vista || 'cards'
    
    if (data.color_principal) {
      config.color_principal = data.color_principal
      applyThemeColor(data.color_principal)
    }
  } catch (e) {
    console.error(e)
  }
}

export const saveConfig = async (updates) => {
  try {
    await api.put('/configuraciones', updates)
    Object.assign(config, updates)
    if (updates.color_principal) {
      applyThemeColor(updates.color_principal)
    }
  } catch (e) {
    console.error(e)
  }
}