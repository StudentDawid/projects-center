<template>
  <v-card color="#1a1a1a" class="mt-4" elevation="4">
    <v-card-title class="text-overline text-amber-darken-3">
      Mercantile Upgrades
    </v-card-title>
    <v-card-text>
      <div class="d-flex flex-wrap gap-2">
        <v-tooltip
          v-for="upgrade in availableUpgrades"
          :key="upgrade.id"
          location="top"
          :text="upgrade.description"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              @click="store.buyUpgrade(upgrade.id)"
              :disabled="
                !store.gold.lt ||
                store.gold.lt(upgrade.cost) ||
                upgrade.purchased
              "
              :color="upgrade.purchased ? 'green-darken-4' : 'amber-darken-4'"
              :variant="upgrade.purchased ? 'tonal' : 'elevated'"
              class="flex-grow-1"
              style="min-width: 120px"
            >
              <div class="d-flex flex-column py-1">
                <span class="text-caption font-weight-bold">{{
                  upgrade.name
                }}</span>
                <span
                  v-if="!upgrade.purchased"
                  class="text-caption text-amber-lighten-4"
                >
                  {{ store.formatNumber(upgrade.cost) }} G
                </span>
                <span v-else class="text-caption text-grey">Owned</span>
              </div>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <div
        v-if="availableUpgrades.length === 0"
        class="text-caption text-grey text-center"
      >
        No upgrades available at this time.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();

// Filter upgrades to show (could add logic to hide distant high-tier upgrades)
const availableUpgrades = computed(() => {
  return store.upgrades;
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
