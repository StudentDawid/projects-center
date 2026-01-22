<template>
  <v-card color="#111" class="mt-4">
    <v-card-title class="text-overline text-grey-lighten-1 d-flex justify-space-between align-center">
      <span>
        <v-icon start size="small">mdi-account-tie</v-icon>
        Factor Management
      </span>
      <v-chip size="small" color="amber-darken-3" variant="flat">
        {{ store.activeFactors.length }} Active
      </v-chip>
    </v-card-title>

    <v-card-subtitle v-if="store.totalFactorUpkeep.gt(0)" class="text-caption text-warning">
      Total Upkeep: -{{ store.formatNumber(store.totalFactorUpkeep) }} GPS
    </v-card-subtitle>

    <v-divider class="mx-4" />

    <v-list bg-color="transparent">
      <v-list-item
        v-for="city in unlockedCities"
        :key="city.id"
        class="border-b border-color-grey-darken-3"
      >
        <template #prepend>
          <v-avatar :color="getFactorColor(city.id)" size="48">
            <v-icon v-if="hasFactor(city.id)" color="white">mdi-account-tie</v-icon>
            <v-icon v-else color="grey">mdi-account-off</v-icon>
          </v-avatar>
        </template>

        <div class="w-100 pl-4 pr-2">
          <v-list-item-title class="font-weight-bold text-amber-lighten-4">
            {{ city.name }}
          </v-list-item-title>

          <div v-if="hasFactor(city.id)" class="mt-2">
            <div class="text-caption text-grey mb-1">
              Automatically trades every {{ Math.floor((getFactor(city.id)?.tradeInterval || 30000) / 1000) }}s
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <v-chip size="x-small" color="blue-grey" variant="flat">
                Level {{ getFactor(city.id)?.level || 1 }}
              </v-chip>
              <v-chip size="x-small" color="green" variant="flat">
                {{ Math.floor((getFactor(city.id)?.efficiency || 0) * 100) }}% Efficiency
              </v-chip>
              <v-chip size="x-small" color="orange" variant="flat">
                {{ getFactor(city.id)?.totalTrades || 0 }} Trades
              </v-chip>
            </div>
            <div class="text-caption text-green-lighten-2 mt-1">
              Profit: +{{ store.formatNumber(getFactor(city.id)?.totalProfit || 0) }} G
            </div>
            <div class="text-caption text-warning mt-1">
              Upkeep: -{{ store.formatNumber(getFactor(city.id)?.upkeepCost || 0) }} GPS
            </div>
          </div>
          <div v-else class="text-caption text-grey mt-1">
            {{ city.description }}
          </div>
        </div>

        <template #append>
          <div class="d-flex flex-column gap-2">
            <v-btn
              v-if="!hasFactor(city.id)"
              :disabled="!store.canAfford(store.getFactorCost(city.id))"
              color="amber-darken-3"
              variant="tonal"
              size="small"
              style="min-width: 120px"
              @click="store.hireFactor(city.id)"
            >
              Hire
              <br />
              {{ store.formatNumber(store.getFactorCost(city.id)) }} G
            </v-btn>
            <div v-else class="d-flex flex-column gap-1">
              <v-btn
                v-if="getFactor(city.id)?.level < 5"
                :disabled="!store.canAfford(getUpgradeCost(city.id))"
                color="blue-darken-2"
                variant="tonal"
                size="small"
                style="min-width: 100px"
                @click="store.upgradeFactor(city.id)"
              >
                Upgrade
                <br />
                {{ store.formatNumber(getUpgradeCost(city.id)) }} G
              </v-btn>
              <v-btn
                color="red-darken-2"
                variant="tonal"
                size="small"
                style="min-width: 100px"
                @click="store.fireFactor(city.id)"
              >
                Fire
              </v-btn>
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <v-card-text v-if="unlockedCities.length === 0" class="text-center text-grey">
      Discover cities to hire Factors.
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import type { City, Factor } from '~/entities/merchant';
import { bn } from '~/shared/lib/big-number';

const store = useMerchantStore();

const unlockedCities = computed(() =>
  store.cities.filter((c) => c.unlocked && c.id !== 'capital')
);

function hasFactor(cityId: string): boolean {
  return !!store.factors.find((f) => f.cityId === cityId && f.hired);
}

function getFactor(cityId: string): Factor | undefined {
  return store.factors.find((f) => f.cityId === cityId && f.hired);
}

function getFactorColor(cityId: string): string {
  if (hasFactor(cityId)) {
    const factor = getFactor(cityId);
    if (factor && factor.level >= 4) return 'green-darken-2';
    if (factor && factor.level >= 2) return 'blue-darken-2';
    return 'amber-darken-2';
  }
  return 'grey-darken-3';
}

function getUpgradeCost(cityId: string) {
  const factor = getFactor(cityId);
  if (!factor) return bn(0);
  return store.getFactorCost(cityId).mul(bn(2).pow(factor.level));
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
