<template>
  <v-card color="#1a1a1a" class="mt-4 prestige-card" elevation="8">
    <v-card-title class="text-h5 text-amber-darken-3 d-flex align-center">
      <v-icon color="amber-darken-3" class="mr-3">mdi-podium-gold</v-icon>
      Grand Guild Hall
    </v-card-title>

    <v-card-text>
      <div
        class="d-flex justify-space-around align-center py-4 bg-black-opacity rounded mb-6"
      >
        <div class="text-center">
          <div class="text-overline text-grey">Current Reputation</div>
          <div class="text-h4 font-weight-bold text-amber-lighten-2 mono-font">
            {{ store.formatNumber(store.reputation) }}
          </div>
          <div class="text-caption text-success mt-1">
            +{{ store.reputationMultiplier.sub(1).mul(100).toFixed(0) }}%
            Production Bonus
          </div>
        </div>

        <v-divider vertical class="mx-4" />

        <div class="text-center">
          <div class="text-overline text-grey">Lifetime Gold</div>
          <div class="text-h6 text-grey-lighten-1 mono-font">
            {{ store.formatNumber(store.lifetimeGold) }}
          </div>
        </div>
      </div>

      <div class="ascent-section pa-4 border-amber rounded">
        <h3 class="text-subtitle-1 text-amber-darken-1 mb-2">
          The Path to Ascension
        </h3>
        <p class="text-body-2 text-grey-lighten-1 mb-4">
          By retiring from your current merchant empire, you can donate your
          wealth to the Grand Guild. In return, you will gain
          <strong>Guild Reputation</strong>, which provides a permanent boost to
          all future business ventures.
        </p>

        <v-alert
          type="info"
          variant="tonal"
          color="amber-darken-4"
          class="mb-4 text-caption"
          density="compact"
        >
          Ascension resets your gold, workers, standard upgrades, cities, and
          caravans. Reputation and prestige upgrades are kept forever.
        </v-alert>

        <div class="d-flex flex-column align-center">
          <div class="text-overline text-grey mb-1">Potential Gain</div>
          <div class="text-h4 text-amber font-weight-black mb-4 mono-font">
            +{{ store.formatNumber(store.prestigeGain) }} Reputation
          </div>

          <v-btn
            class="ascent-btn"
            block
            color="amber-darken-4"
            size="x-large"
            :disabled="store.prestigeGain.eq(0)"
            @click="confirmPrestige = true"
          >
            Retire and Ascend
          </v-btn>
          <span
            v-if="store.prestigeGain.eq(0)"
            class="text-caption text-error mt-2"
          >
            Requires at least 1.00T lifetime gold to gain reputation.
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmPrestige" max-width="400">
      <v-card color="#222" class="pa-4">
        <v-card-title class="text-h6 text-amber"
          >Confirm Ascension</v-card-title
        >
        <v-card-text class="text-body-2">
          Are you sure you want to retire? Your current progress will be reset,
          and you will receive
          <strong
            >{{ store.formatNumber(store.prestigeGain) }} Reputation</strong
          >.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="grey" @click="confirmPrestige = false"
            >Cancel</v-btn
          >
          <v-btn color="amber-darken-3" @click="doPrestige">Ascend</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();
const confirmPrestige = ref(false);

const doPrestige = () => {
  store.prestige();
  confirmPrestige.value = false;
};
</script>

<style scoped>
.prestige-card {
  border: 1px solid rgba(255, 179, 0, 0.2);
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
}

.bg-black-opacity {
  background: rgba(0, 0, 0, 0.4);
}

.mono-font {
  font-family: 'Roboto Mono', monospace !important;
}

.border-amber {
  border: 1px solid rgba(255, 179, 0, 0.15);
}

.ascent-btn {
  letter-spacing: 2px;
  font-weight: 900;
  box-shadow: 0 0 20px rgba(255, 179, 0, 0.2);
}

.ascent-btn:hover {
  box-shadow: 0 0 30px rgba(255, 179, 0, 0.4);
}
</style>
