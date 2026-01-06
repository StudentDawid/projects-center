<template>
  <v-card
    class="building-card"
    :class="{
      'building-card--affordable': canAfford,
      'building-card--owned': count > 0,
      'building-card--max-level': isMaxLevel,
      'building-card--tier-2': tier === 2,
      'building-card--tier-3': tier === 3,
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
          <!-- Level Badge -->
          <div v-if="count > 0" class="building-level" :class="{ 'max-level': isMaxLevel }">
            <v-icon v-if="isMaxLevel" icon="mdi-star" size="10" />
            Lv.{{ level }}
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="building-info flex-grow-1 pa-4">
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <h3 class="building-name text-h6">{{ name }}</h3>
            <!-- Tier Badge -->
            <v-chip
              v-if="tier > 1"
              :color="tier === 2 ? 'purple' : 'orange'"
              size="x-small"
              label
              class="tier-badge"
            >
              T{{ tier }}
            </v-chip>
          </div>
          <!-- Level Progress -->
          <div v-if="count > 0" class="level-indicator">
            <div class="level-dots">
              <span
                v-for="i in maxLevel"
                :key="i"
                class="level-dot"
                :class="{ 'filled': i <= level, 'max': i === maxLevel && level >= maxLevel }"
              />
            </div>
          </div>
        </div>

        <p class="building-description text-body-2 text-medium-emphasis mb-2">
          {{ description }}
        </p>

        <!-- Level Bonus Info -->
        <div v-if="count > 0 && level > 1" class="level-bonus text-caption mb-2">
          <v-icon icon="mdi-arrow-up-bold" size="12" color="success" />
          <span class="text-success">Bonus Lv.{{ level }}: +{{ ((level - 1) * 50) }}% produkcji</span>
          <span v-if="level > 1" class="text-info ml-2">-{{ ((level - 1) * 10) }}% konsumpcji</span>
        </div>

        <!-- Special Effect (Tier 2+) -->
        <div v-if="specialEffect && count > 0" class="special-effect text-caption mb-2">
          <v-icon icon="mdi-lightning-bolt" size="12" color="purple-lighten-2" />
          <span class="text-purple-lighten-2">{{ specialEffect }}</span>
        </div>

        <!-- Max Level Special Effect -->
        <div v-if="isMaxLevel && maxLevelEffect" class="max-level-effect text-caption mb-2">
          <v-icon icon="mdi-star-four-points" size="12" color="warning" />
          <span class="text-warning">{{ maxLevelEffect }}</span>
        </div>

        <!-- Prerequisites (for locked Tier 2+ buildings) -->
        <div v-if="prerequisitesDisplay && count === 0" class="prerequisites text-caption mb-2">
          <v-icon icon="mdi-lock" size="12" color="info" />
          <span class="text-info">Wymaga: {{ prerequisitesDisplay }}</span>
        </div>

        <!-- Production Info -->
        <div class="building-stats text-caption mb-3">
          <div v-if="productionDisplay" class="building-production">
            <v-icon icon="mdi-arrow-up" size="14" color="success" class="mr-1" />
            <span class="text-success">{{ productionDisplay }}</span>
            <span v-if="count > 0 && level > 1" class="text-success-darken-2 ml-1">
              (×{{ (1 + (level - 1) * 0.5).toFixed(1) }})
            </span>
          </div>
          <div v-if="consumptionDisplay" class="building-consumption">
            <v-icon icon="mdi-arrow-down" size="14" color="error" class="mr-1" />
            <span class="text-error">{{ consumptionDisplay }}</span>
            <span v-if="count > 0 && level > 1" class="text-success ml-1">
              (×{{ (1 - (level - 1) * 0.1).toFixed(1) }})
            </span>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="building-actions">
          <!-- Buy Section with quantity buttons -->
          <div class="buy-section">
            <div class="building-cost text-body-2 mb-1" :class="{ 'text-error': !canAfford }">
              <v-icon icon="mdi-cash" size="16" class="mr-1" />
              {{ displayedCost }}
            </div>

            <!-- Quantity Selector -->
            <div class="quantity-buttons d-flex gap-1 mb-2">
              <v-btn
                v-for="qty in [1, 5, 25, 100]"
                :key="qty"
                :variant="selectedQuantity === qty ? 'flat' : 'outlined'"
                :color="selectedQuantity === qty ? 'primary' : 'default'"
                size="small"
                class="quantity-btn"
                @click="selectedQuantity = qty"
              >
                {{ qty }}
              </v-btn>
              <v-btn
                :variant="selectedQuantity === -1 ? 'flat' : 'outlined'"
                :color="selectedQuantity === -1 ? 'warning' : 'default'"
                size="small"
                class="quantity-btn max-btn"
                @click="selectedQuantity = -1"
              >
                MAX
              </v-btn>
            </div>

            <v-btn
              :disabled="!canAffordSelected"
              :color="canAffordSelected ? 'primary' : 'grey'"
              size="small"
              class="building-buy-btn"
              @click="handleBuy"
            >
              <v-icon icon="mdi-plus" size="18" class="mr-1" />
              Kup {{ effectiveQuantity > 1 ? `(${effectiveQuantity})` : '' }}
            </v-btn>
          </div>

          <!-- Upgrade Section -->
          <div v-if="count > 0 && !isMaxLevel" class="upgrade-section">
            <div class="upgrade-cost text-body-2 mb-1" :class="{ 'text-error': !canAffordUpgrade }">
              <v-icon icon="mdi-arrow-up-bold-circle" size="16" class="mr-1" />
              {{ upgradeCostDisplay }}
            </div>
            <v-btn
              :disabled="!canAffordUpgrade"
              :color="canAffordUpgrade ? 'success' : 'grey'"
              size="small"
              class="building-upgrade-btn"
              @click="handleUpgrade"
            >
              <v-icon icon="mdi-arrow-up-bold" size="18" class="mr-1" />
              Ulepsz
            </v-btn>
          </div>

          <!-- Max Level Badge -->
          <div v-if="isMaxLevel" class="max-level-badge">
            <v-chip color="warning" size="small" label>
              <v-icon start icon="mdi-star" size="14" />
              MAX
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Owned indicator -->
    <div v-if="count > 0" class="building-owned-indicator" :class="{ 'max-level': isMaxLevel }" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EntityId, EntityTier } from '~/shared/types/game.types';
import { useEntityStore } from '~/stores/entities';

interface Props {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  level: number;
  maxLevel: number;
  tier: EntityTier;
  costDisplay: string;
  upgradeCostDisplay: string;
  productionDisplay: string;
  consumptionDisplay?: string;
  maxLevelEffect?: string;
  specialEffect?: string;
  prerequisitesDisplay?: string;
  canAfford: boolean;
  canAffordUpgrade: boolean;
  isMaxLevel: boolean;
}

const props = defineProps<Props>();
const entityStore = useEntityStore();

const emit = defineEmits<{
  buy: [id: string, quantity: number];
  upgrade: [id: string];
}>();

// -1 means MAX
const selectedQuantity = ref(1);

// Calculate max affordable
const maxAffordable = computed(() => {
  return entityStore.calculateMaxAffordable(props.id as EntityId);
});

// Effective quantity (actual number to buy)
const effectiveQuantity = computed(() => {
  if (selectedQuantity.value === -1) {
    return maxAffordable.value;
  }
  return Math.min(selectedQuantity.value, maxAffordable.value);
});

// Can afford selected quantity
const canAffordSelected = computed(() => {
  if (effectiveQuantity.value <= 0) return false;
  return entityStore.canAffordMultiple(props.id as EntityId, effectiveQuantity.value);
});

// Display cost for selected quantity
const displayedCost = computed(() => {
  const qty = effectiveQuantity.value;
  if (qty <= 0) return props.costDisplay;
  if (qty === 1) return props.costDisplay;
  return entityStore.getFormattedCostForMultiple(props.id as EntityId, qty);
});

function handleBuy() {
  if (canAffordSelected.value && effectiveQuantity.value > 0) {
    emit('buy', props.id, effectiveQuantity.value);
  }
}

function handleUpgrade() {
  if (props.canAffordUpgrade && !props.isMaxLevel) {
    emit('upgrade', props.id);
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

  &--max-level {
    border: 1px solid rgba(255, 193, 7, 0.4);

    .building-icon-section {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.15));
    }
  }

  &--tier-2 {
    border: 1px solid rgba(156, 39, 176, 0.3);

    .building-icon-section {
      background: linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(103, 58, 183, 0.15));
    }
  }

  &--tier-3 {
    border: 1px solid rgba(255, 152, 0, 0.3);

    .building-icon-section {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 87, 34, 0.15));
    }
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

.building-level {
  position: absolute;
  top: -8px;
  left: -12px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  font-family: var(--font-body-solmar);
  font-weight: 700;
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;

  &.max-level {
    background: linear-gradient(135deg, #ffc107, #ff9800);
    animation: glow-pulse 2s ease-in-out infinite;
  }
}

.level-indicator {
  .level-dots {
    display: flex;
    gap: 3px;

    .level-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.2s;

      &.filled {
        background: rgb(var(--v-theme-success));
        border-color: rgb(var(--v-theme-success));
      }

      &.max {
        background: linear-gradient(135deg, #ffc107, #ff9800);
        border-color: #ffc107;
        animation: glow-pulse 2s ease-in-out infinite;
      }
    }
  }
}

.level-bonus {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  width: fit-content;
}

.special-effect {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(156, 39, 176, 0.15);
  border-radius: 4px;
  width: fit-content;
}

.max-level-effect {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(255, 193, 7, 0.15);
  border-radius: 4px;
  width: fit-content;
}

.prerequisites {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  width: fit-content;
}

.tier-badge {
  font-weight: 700;
  font-size: 0.65rem !important;
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

.building-cost,
.upgrade-cost {
  font-family: var(--font-body-solmar);
  font-size: 0.75rem;
}

.building-actions {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.buy-section {
  flex: 1;
  min-width: 200px;
}

.quantity-buttons {
  flex-wrap: wrap;
  align-items: stretch;
}

.quantity-btn {
  min-width: 36px !important;
  height: 28px !important;
  font-weight: 600;
  font-size: 0.75rem !important;
  padding: 0 8px !important;

  &.max-btn {
    min-width: 48px !important;
  }
}

.building-buy-btn,
.building-upgrade-btn {
  min-width: 100px;
}

.upgrade-section {
  text-align: right;
  min-width: 120px;
}

.max-level-badge {
  display: flex;
  align-items: flex-end;
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

  &.max-level {
    background: linear-gradient(
      90deg,
      transparent 0%,
      #ffc107 20%,
      #ff9800 50%,
      #ffc107 80%,
      transparent 100%
    );
  }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(255, 193, 7, 0.5); }
  50% { opacity: 0.9; box-shadow: 0 0 8px rgba(255, 193, 7, 0.8); }
}
</style>
