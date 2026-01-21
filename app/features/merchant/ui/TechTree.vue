<template>
  <v-card color="#1a1a1a" class="mt-4" elevation="4">
    <v-card-title class="text-overline text-amber-darken-3">
      Mercantile Upgrades
    </v-card-title>
    <v-tabs v-model="tab" color="amber-darken-3" grow density="compact">
      <v-tab value="available">Available</v-tab>
      <v-tab value="owned">Owned</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <!-- Available Tab -->
        <v-window-item value="available">
          <div class="d-flex flex-wrap gap-2">
            <v-tooltip
              v-for="upgrade in availableUpgrades"
              :key="upgrade.id"
              location="top"
              :text="upgrade.description"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :disabled="!store.canAfford(upgrade.cost)"
                  color="amber-darken-4"
                  variant="elevated"
                  class="flex-grow-1"
                  height="auto"
                  style="min-width: 120px; min-height: 48px; padding: 8px 16px"
                  @click="store.buyUpgrade(upgrade.id)"
                >
                  <div class="d-flex flex-column align-center py-1">
                    <span
                      class="text-caption font-weight-bold text-wrap text-center"
                      style="line-height: 1.2"
                      >{{ upgrade.name }}</span
                    >
                    <span class="text-caption text-amber-lighten-4 mt-1">
                      {{ store.formatNumber(upgrade.cost) }} G
                    </span>
                  </div>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
          <div
            v-if="availableUpgrades.length === 0"
            class="text-caption text-grey text-center mt-4"
          >
            No new technologies available.
          </div>
        </v-window-item>

        <!-- Owned Tab -->
        <v-window-item value="owned">
          <div class="d-flex flex-wrap gap-2">
            <v-card
              v-for="upgrade in ownedUpgrades"
              :key="upgrade.id"
              color="grey-darken-4"
              variant="tonal"
              class="flex-grow-1 pa-2 border-amber"
              style="min-width: 120px"
            >
              <div class="d-flex flex-column align-center">
                <span
                  class="text-caption font-weight-bold text-amber-darken-3 text-center"
                  >{{ upgrade.name }}</span
                >
                <span
                  class="text-caption text-grey text-center"
                  style="font-size: 0.7rem !important"
                  >{{ upgrade.description }}</span
                >
              </div>
            </v-card>
          </div>
          <div
            v-if="ownedUpgrades.length === 0"
            class="text-caption text-grey text-center mt-4"
          >
            You haven't purchased any upgrades yet.
          </div>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();
const tab = ref('available');

const availableUpgrades = computed(() => {
  return store.upgrades.filter((u) => !u.purchased);
});

const ownedUpgrades = computed(() => {
  return store.upgrades.filter((u) => u.purchased);
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.border-amber {
  border: 1px solid rgba(255, 179, 0, 0.3);
}
</style>
