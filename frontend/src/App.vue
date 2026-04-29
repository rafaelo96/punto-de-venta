<template>
  <div id="app">
    <router-view />
    <ToastContainer />
    <GlobalLoading />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'

const authStore = useAuthStore()
authStore.checkAuth()
</script>