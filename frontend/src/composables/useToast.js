import { reactive, readonly } from 'vue'

const state = reactive({
  toasts: []
})

let toastId = 0

export function useToast() {
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = ++toastId
    state.toasts.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  const removeToast = (id) => {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index !== -1) {
      state.toasts.splice(index, 1)
    }
  }

  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)
  const info = (message, duration) => addToast(message, 'info', duration)

  return {
    toasts: readonly(state.toasts),
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}