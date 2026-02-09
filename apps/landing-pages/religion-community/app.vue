<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'light',
  },
  bodyAttrs: {
    class: 'bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300',
  },
});
</script>
