<template>
  <div class="stat-item pa-2 rounded bg-black-opacity">
    <div class="text-overline text-grey-darken-2 lh-1 mb-1">{{ label }}</div>
    <div class="text-body-1 mono-font text-grey-lighten-2">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>

<style scoped>
.bg-black-opacity {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.mono-font {
  font-family: 'Roboto Mono', monospace !important;
}

.lh-1 {
  line-height: 1;
}
</style>

