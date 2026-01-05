<template>
  <v-card class="resource-card pa-3" :class="{ 'resource-card--active': isActive }">
    <div class="d-flex align-center">
      <!-- Icon -->
      <v-icon :icon="icon" size="32" class="resource-icon mr-3" :color="iconColor" />

      <!-- Info -->
      <div class="flex-grow-1">
        <div class="d-flex align-center justify-space-between">
          <span class="resource-name text-body-2 text-medium-emphasis">{{ name }}</span>
          <span class="resource-per-second text-caption" :class="perSecondClass">
            {{ formattedPerSecond }}/s
          </span>
        </div>

        <div class="resource-value mt-1">
          {{ formattedAmount }}
        </div>

        <!-- Progress bar for capped resources -->
        <v-progress-linear
          v-if="maxAmount"
          :model-value="progressPercent"
          class="mt-2"
          :color="iconColor"
          bg-color="surface-variant"
        />
      </div>
    </div>

    <!-- Tooltip with description -->
    <v-tooltip activator="parent" location="bottom" :text="description" />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Decimal from 'break_infinity.js';
import { formatWithCommas, formatNumber } from '~/shared/lib/big-number';

interface Props {
  name: string;
  description: string;
  icon: string;
  amount: Decimal;
  perSecond: Decimal;
  maxAmount?: Decimal | null;
  iconColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  maxAmount: null,
});

const formattedAmount = computed(() => formatWithCommas(props.amount));

const formattedPerSecond = computed(() => {
  const value = formatNumber(props.perSecond);
  return props.perSecond.gte(0) ? `+${value}` : value;
});

const perSecondClass = computed(() => ({
  'text-success': props.perSecond.gt(0),
  'text-error': props.perSecond.lt(0),
  'text-disabled': props.perSecond.eq(0),
}));

const progressPercent = computed(() => {
  if (!props.maxAmount || props.maxAmount.eq(0)) return 0;
  return props.amount.div(props.maxAmount).mul(100).toNumber();
});

const isActive = computed(() => props.perSecond.gt(0));
</script>

<style scoped lang="scss">
.resource-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: rgb(var(--v-theme-primary));
    opacity: 0.3;
    transition: opacity 0.3s ease;
  }

  &--active::before {
    opacity: 1;
  }

  &:hover {
    transform: translateX(4px);
  }
}

.resource-icon {
  opacity: 0.9;
  filter: drop-shadow(0 0 4px currentColor);
}

.resource-name {
  font-family: var(--font-lore-solmar);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.resource-value {
  font-family: var(--font-body-solmar);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.3);
}

.resource-per-second {
  font-family: var(--font-body-solmar);
}
</style>

