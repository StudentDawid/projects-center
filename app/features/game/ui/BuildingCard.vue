<template>
  <v-card
    class="building-card"
    :class="{
      'building-card--affordable': canAfford,
      'building-card--owned': count > 0,
    }"
  >
    <div class="d-flex">
      <!-- Icon Section -->
      <div class="building-icon-section pa-4 d-flex align-center justify-center">
        <div class="building-icon-wrapper">
          <v-icon :icon="icon" size="48" :color="canAfford ? 'primary' : 'grey'" />
          <div v-if="count > 0" class="building-count">
            {{ count }}
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="building-info flex-grow-1 pa-4">
        <div class="d-flex align-center justify-space-between mb-1">
          <h3 class="building-name text-h6">{{ name }}</h3>
        </div>

        <p class="building-description text-body-2 text-medium-emphasis mb-3">
          {{ description }}
        </p>

        <!-- Production Info -->
        <div class="building-stats text-caption mb-3">
          <div v-if="productionDisplay" class="building-production">
            <v-icon icon="mdi-arrow-up" size="14" color="success" class="mr-1" />
            <span class="text-success">{{ productionDisplay }}</span>
          </div>
          <div v-if="consumptionDisplay" class="building-consumption">
            <v-icon icon="mdi-arrow-down" size="14" color="error" class="mr-1" />
            <span class="text-error">{{ consumptionDisplay }}</span>
          </div>
        </div>

        <!-- Cost & Buy Button -->
        <div class="d-flex align-center justify-space-between">
          <div class="building-cost text-body-2" :class="{ 'text-error': !canAfford }">
            <v-icon icon="mdi-cash" size="16" class="mr-1" />
            {{ costDisplay }}
          </div>

          <v-btn
            :disabled="!canAfford"
            :color="canAfford ? 'primary' : 'grey'"
            size="small"
            class="building-buy-btn"
            @click="handleBuy"
          >
            <v-icon icon="mdi-plus" size="18" class="mr-1" />
            Kup
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Owned indicator -->
    <div v-if="count > 0" class="building-owned-indicator" />
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  costDisplay: string;
  productionDisplay: string;
  consumptionDisplay?: string;
  canAfford: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  buy: [id: string];
}>();

function handleBuy() {
  if (props.canAfford) {
    emit('buy', props.id);
  }
}
</script>

<style scoped lang="scss">
.building-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 0.7;

  &--affordable {
    opacity: 1;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
    }
  }

  &--owned {
    opacity: 1;
  }
}

.building-icon-section {
  background: rgba(0, 0, 0, 0.2);
  min-width: 100px;
  border-right: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.building-icon-wrapper {
  position: relative;
}

.building-count {
  position: absolute;
  bottom: -8px;
  right: -12px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-family: var(--font-body-solmar);
  font-weight: 700;
  font-size: 0.875rem;
  padding: 2px 8px;
  border-radius: 0;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.building-name {
  font-family: var(--font-lore-solmar) !important;
  letter-spacing: 0.02em;
}

.building-description {
  line-height: 1.4;
  min-height: 2.8em;
}

.building-production {
  font-family: var(--font-body-solmar);
}

.building-cost {
  font-family: var(--font-body-solmar);
}

.building-buy-btn {
  min-width: 80px;
}

.building-owned-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(var(--v-theme-primary)) 20%,
    rgb(var(--v-theme-primary)) 80%,
    transparent 100%
  );
}
</style>

