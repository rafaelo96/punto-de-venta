<template>
  <Teleport to="body">
    <Transition name="loading">
      <div v-if="isLoading.isLoading" class="fixed inset-0 z-[200] bg-neutral-900/40 backdrop-blur-md flex items-center justify-center">
        <div class="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-5">
          <div class="relative">
            <div class="absolute inset-0 blur-md opacity-50 rounded-full animate-ping" :style="{ backgroundColor: colorPrincipal }"></div>
            <Loader2 class="w-16 h-16 relative animate-spin" :style="{ color: colorPrincipal }" />
          </div>
          <p v-if="isLoading.message" class="text-lg font-semibold text-neutral-700">{{ isLoading.message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next'
import { useLoading } from '@/composables/useLoading'
import { computed } from 'vue'

const { isLoading } = useLoading()
const colorPrincipal = computed(() => {
  const saved = localStorage.getItem('color_principal')
  return saved || '#3b82f6'
})
</script>

<style scoped>
.loading-enter-active, .loading-leave-active {
  transition: opacity 0.3s ease;
}
.loading-enter-from, .loading-leave-to {
  opacity: 0;
}
</style>