import { reactive, readonly } from 'vue'

const initialState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  tone: 'danger',
  resolve: null
}

const state = reactive({ ...initialState })

const close = (result) => {
  const resolve = state.resolve
  Object.assign(state, initialState)
  resolve?.(result)
}

export function useConfirm() {
  const requestConfirmation = (options = {}) => {
    if (state.resolve) {
      close(false)
    }

    return new Promise((resolve) => {
      Object.assign(state, {
        ...initialState,
        ...options,
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message || 'Esta acción necesita tu confirmación.',
        resolve
      })
    })
  }

  return {
    confirmation: readonly(state),
    requestConfirmation,
    confirmAction: () => close(true),
    cancelAction: () => close(false)
  }
}
