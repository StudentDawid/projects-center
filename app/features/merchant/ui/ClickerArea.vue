<template>
  <div class="d-flex justify-center align-center py-8">
    <v-btn
      color="brown-darken-4"
      size="x-large"
      height="120"
      width="120"
      class="clicker-btn rounded-circle elevation-10"
      ripple
      @click="handleClick"
    >
      <div class="d-flex flex-column align-center">
        <v-icon size="40" class="mb-2">mdi-hand-coin</v-icon>
        <span class="text-caption">Trade</span>
      </div>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'trade', payload: { x: number; y: number }): void;
}>();

const handleClick = (event: MouseEvent) => {
  emit('trade', { x: event.clientX, y: event.clientY });
};
</script>

<style scoped>
.clicker-btn {
  border: 4px solid #4e342e;
  transition: transform 0.05s;
}
.clicker-btn:active {
  transform: scale(0.95);
}
</style>
