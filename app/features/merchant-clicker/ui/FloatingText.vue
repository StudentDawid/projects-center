<template>
  <div class="floating-text-container">
    <transition-group name="float">
      <div
        v-for="item in items"
        :key="item.id"
        class="floating-item"
        :style="{ left: item.x + 'px', top: item.y + 'px' }"
      >
        <span class="text-h6 font-weight-bold text-amber-lighten-2 text-shadow">
          +{{ item.text }}
        </span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
export interface FloatingItem {
  id: string;
  x: number;
  y: number;
  text: string;
}

defineProps<{
  items: FloatingItem[];
}>();
</script>

<style scoped>
.floating-text-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.floating-item {
  position: absolute;
  transform: translate(-50%, -50%); /* Center on click */
  opacity: 0;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  font-family: 'Cinzel', serif;
}

/* Transitions */
.float-enter-active {
  animation: floatUp 1s ease-out forwards;
}
.float-leave-active {
  transition: opacity 0.5s;
}
.float-enter-from,
.float-leave-to {
  opacity: 0;
}

@keyframes floatUp {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -150px) scale(1);
    opacity: 0;
  }
}
</style>

