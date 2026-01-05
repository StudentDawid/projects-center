<template>
  <v-app :theme="currentTheme">
    <v-main class="game-main">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Default theme - Solmar (Teokracja)
const currentTheme = ref('solmar');

// Provide theme switching capability
provide('currentTheme', currentTheme);
provide('setTheme', (theme: string) => {
  currentTheme.value = theme;
});
</script>

<style scoped lang="scss">
.game-main {
  min-height: 100vh;
  background:
    var(--texture-noise),
    radial-gradient(ellipse at top, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 1) 70%);
}
</style>
