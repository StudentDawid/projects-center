<template>
  <v-app :theme="currentTheme">
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>Religion Community</v-app-bar-title>
      
      <template #append>
        <v-btn 
          :icon="currentTheme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          @click="toggleTheme"
        />
      </template>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>

    <v-footer class="text-center" color="primary">
      <div class="w-100 py-4">
        {{ new Date().getFullYear() }} — <strong>Religion Community</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Default theme
const currentTheme = ref('light');

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
};

// Provide theme switching capability
provide('currentTheme', currentTheme);
provide('setTheme', (theme: string) => {
  currentTheme.value = theme;
});
</script>

<style scoped lang="scss">
.v-main {
  min-height: calc(100vh - 64px - 64px); // viewport - appbar - footer
}
</style>
