<script setup lang="ts">
/**
 * Notifications component - displays toast notifications
 */

import { useAteriaGameStore } from '../model/game.store';

const gameStore = useAteriaGameStore();

function getColor(type: string): string {
  const colors: Record<string, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    achievement: 'purple',
  };
  return colors[type] || 'info';
}
</script>

<template>
  <div class="notifications-container">
    <TransitionGroup
      name="notification"
      tag="div"
      class="notification-list"
    >
      <div
        v-for="notification in gameStore.notifications.slice(-5)"
        :key="notification.id"
        class="notification-item"
      >
        <v-alert
          :color="getColor(notification.type)"
          :icon="notification.icon"
          closable
          variant="elevated"
          density="comfortable"
          class="notification-alert"
          @click:close="gameStore.removeNotification(notification.id)"
        >
          <div class="font-weight-bold">
            {{ notification.title }}
          </div>
          <div class="text-caption">
            {{ notification.message }}
          </div>
        </v-alert>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  top: 64px;
  right: 16px;
  z-index: 1000;
  pointer-events: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  pointer-events: auto;
  min-width: 280px;
  max-width: 360px;
}

.notification-alert {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
