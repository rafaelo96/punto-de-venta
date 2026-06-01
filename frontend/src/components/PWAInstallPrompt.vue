<template>
  <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl p-6 z-50 border border-neutral-200 animate-slide-up">
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
        <Download class="w-6 h-6 text-white" />
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-neutral-900 mb-1">Instalar Vendi Pro</h3>
        <p class="text-sm text-neutral-600 mb-4">Accede rápido y trabaja sin abrir el navegador</p>
        <div class="flex gap-3">
          <button @click="showInstallHelp" class="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
            Ver instrucciones
          </button>
          <button @click="dismissPrompt" class="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Download } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const showPrompt = ref(false)
const toast = useToast()

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  showPrompt.value = true
}

const showInstallHelp = () => {
  toast.info('Para instalar Vendi Pro, usa la opción Instalar app del menú del navegador.', 7000)
}

const dismissPrompt = () => {
  showPrompt.value = false
  // Remember that user dismissed the prompt
  localStorage.setItem('pwa-prompt-dismissed', 'true')
}

onMounted(() => {
  // Check if user previously dismissed
  if (localStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return
  }
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showPrompt.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>
