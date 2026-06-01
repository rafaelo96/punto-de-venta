<template>
  <Teleport to="body">
    <Transition name="confirm-backdrop">
      <div
        v-if="confirmation.isOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/55 px-4"
        @click.self="cancelAction"
      >
        <Transition name="confirm-panel" appear>
          <section
            class="w-full max-w-md rounded-xl border border-[rgb(var(--neutral-200))] bg-[rgb(var(--surface-100))] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                :class="tone.iconWrap"
              >
                <component :is="tone.icon" class="h-5 w-5" :class="tone.iconText" />
              </div>

              <div class="min-w-0 flex-1">
                <h2 :id="titleId" class="text-lg font-bold text-[rgb(var(--neutral-900))]">
                  {{ confirmation.title }}
                </h2>
                <p class="mt-2 text-sm leading-6 text-[rgb(var(--neutral-600))]">
                  {{ confirmation.message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-[rgb(var(--neutral-200))] bg-[rgb(var(--surface-100))] px-4 py-2 text-sm font-semibold text-[rgb(var(--neutral-700))] shadow-none transition-colors hover:bg-[rgb(var(--surface-200))]"
                @click="cancelAction"
              >
                {{ confirmation.cancelText }}
              </button>
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-none transition-transform active:scale-[0.98]"
                :class="tone.button"
                :style="tone.buttonStyle"
                @click="confirmAction"
              >
                {{ confirmation.confirmText }}
              </button>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, Info, CheckCircle } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'

const titleId = 'app-confirm-title'
const { confirmation, confirmAction, cancelAction } = useConfirm()

const tones = {
  danger: {
    icon: AlertTriangle,
    iconWrap: 'bg-red-50',
    iconText: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700',
    buttonStyle: {}
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50',
    iconText: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
    buttonStyle: {}
  },
  info: {
    icon: Info,
    iconWrap: 'bg-blue-50',
    iconText: 'text-blue-700',
    button: '',
    buttonStyle: { backgroundColor: 'rgb(var(--color-primary))' }
  },
  success: {
    icon: CheckCircle,
    iconWrap: 'bg-emerald-50',
    iconText: 'text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    buttonStyle: {}
  }
}

const tone = computed(() => tones[confirmation.tone] || tones.danger)

const handleKeydown = (event) => {
  if (!confirmation.isOpen) return
  if (event.key === 'Escape') cancelAction()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.confirm-backdrop-enter-active,
.confirm-backdrop-leave-active {
  transition: opacity 160ms ease-out;
}

.confirm-backdrop-enter-from,
.confirm-backdrop-leave-to {
  opacity: 0;
}

.confirm-panel-enter-active,
.confirm-panel-leave-active {
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}

.confirm-panel-enter-from,
.confirm-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
