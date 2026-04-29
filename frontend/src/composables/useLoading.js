import { reactive, readonly } from 'vue'

const state = reactive({
  isLoading: false,
  message: ''
})

export function useLoading() {
  const startLoading = (message = 'Cargando...') => {
    state.isLoading = true
    state.message = message
  }

  const stopLoading = () => {
    state.isLoading = false
    state.message = ''
  }

  return {
    isLoading: readonly(state),
    isLoadingState: state,
    startLoading,
    stopLoading
  }
}