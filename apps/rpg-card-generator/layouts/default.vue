<template>
  <v-app :theme="currentTheme" class="app-bg">
    <v-main class="d-flex flex-column" style="min-height: 100vh;">
      <SharedAppNavbar />
      <v-divider></v-divider>
      <div class="flex-grow-1 overflow-hidden">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';

const currentTheme = ref('light');

provide('currentTheme', currentTheme);
provide('setTheme', (theme: string) => {
  currentTheme.value = theme;
});
</script>

<style scoped lang="scss">
.app-bg {
  background-color: #ffffff;
  min-height: 100vh;
}
</style>
