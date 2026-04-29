<template>
  <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl p-6 z-50 border border-neutral-200 animate-slide-up">
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
        <Download class="w-6 h-6 text-white" />
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-neutral-900 mb-1">Instalar Aplicación</h3>
        <p class="text-sm text-neutral-600 mb-4">Instala el POS para acceso rápido y uso sin navegador</p>
        <div class="flex gap-3">
          <button @click="installApp" class="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm" :style="{ backgroundColor: 'rgb(var(--color-primary))' }">
            Instalar
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

const showPrompt = ref(false)
let deferredPrompt = null

const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  // Update UI to notify the user they can add to home screen
  showPrompt.value = true
}

const installApp = async () => {
  if (!deferredPrompt) return
  // Show the install prompt
  deferredPrompt.prompt()
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice
  console.log(`User response to the install prompt: ${outcome}`)
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null
  showPrompt.value = false
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
