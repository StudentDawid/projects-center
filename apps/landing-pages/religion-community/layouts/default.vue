<template>
    <div class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">
      <!-- Header -->
      <Header />

      <!-- Page slot -->
      <main class="flex-grow">
        <slot />
      </main>

      <!-- Footer -->
      <Footer />
    </div>
  </template>

  <script setup lang="ts">
  import Header from '@features/religion-community/ui/Header.vue'
  import Footer from '@features/religion-community/ui/Footer.vue'
  </script>

  <style scoped lang="scss">
  /* Layout-specific styles (if needed) */
  </style>
