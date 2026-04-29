<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl backdrop-blur-md border max-w-sm"
          :class="toastClasses[toast.type]"
        >
          <component :is="toastIcons[toast.type]" class="w-5 h-5 flex-shrink-0" />
          <p class="text-sm font-semibold flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { Check, X, AlertTriangle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-emerald-50/95 text-emerald-800 border-emerald-200',
  error: 'bg-red-50/95 text-red-800 border-red-200',
  warning: 'bg-amber-50/95 text-amber-800 border-amber-200',
  info: 'bg-blue-50/95 text-blue-800 border-blue-200'
}

const toastIcons = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info
}
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}
.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
</style>