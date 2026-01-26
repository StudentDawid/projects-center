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
    >
      <v-snackbar
        v-for="notification in gameStore.notifications.slice(-5)"
        :key="notification.id"
        :model-value="true"
        :timeout="-1"
        :color="getColor(notification.type)"
        location="top right"
        class="notification-snackbar"
        multi-line
      >
        <div class="d-flex align-center">
          <v-icon
            v-if="notification.icon"
            :icon="notification.icon"
            class="mr-2"
          />
          <div>
            <div class="font-weight-bold">
              {{ notification.title }}
            </div>
            <div class="text-caption">
              {{ notification.message }}
            </div>
          </div>
        </div>

        <template #actions>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="gameStore.removeNotification(notification.id)"
          >
            <v-icon size="small">
              mdi-close
            </v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  top: 64px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.notifications-container > * {
  pointer-events: auto;
}

.notification-snackbar {
  position: relative !important;
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
