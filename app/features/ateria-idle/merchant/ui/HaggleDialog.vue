<script setup lang="ts">
/**
 * Haggle Dialog - UI for negotiating with customers
 */

import { computed, ref } from 'vue';
import { useAteriaMerchantStore } from '../model/merchant.store';
import { HAGGLE_TACTICS, type HaggleTactic, type HaggleTacticResult } from '../../data/market.data';
import { getItem } from '../../data/items.data';

const merchantStore = useAteriaMerchantStore();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Local state
const lastTacticResult = ref<HaggleTacticResult | null>(null);
const showResultAnimation = ref(false);

// Computed
const haggle = computed(() => merchantStore.activeHaggle);

const customer = computed(() => {
  if (!haggle.value) return null;
  return merchantStore.customers.find(c => c.id === haggle.value!.customerId);
});

const item = computed(() => {
  if (!haggle.value) return null;
  return getItem(haggle.value.itemId);
});

const pricePercent = computed(() => {
  if (!haggle.value) return 0;
  return Math.round((haggle.value.currentOffer / haggle.value.originalPrice) * 100);
});

const patiencePercent = computed(() => {
  if (!haggle.value) return 0;
  return haggle.value.customerPatience;
});

const maxOfferPercent = computed(() => {
  if (!haggle.value) return 0;
  return Math.round((haggle.value.customerMaxPrice / haggle.value.originalPrice) * 100);
});

const tactics = computed(() => {
  return Object.values(HAGGLE_TACTICS);
});

function isTacticAvailable(tacticId: HaggleTactic): boolean {
  const cooldown = merchantStore.tacticCooldowns.get(tacticId) || 0;
  return cooldown <= 0;
}

function getTacticCooldown(tacticId: HaggleTactic): number {
  return merchantStore.tacticCooldowns.get(tacticId) || 0;
}

// Actions
function useTactic(tacticId: HaggleTactic) {
  if (!isTacticAvailable(tacticId)) return;

  const result = merchantStore.useHaggleTactic(tacticId);
  lastTacticResult.value = result;
  showResultAnimation.value = true;

  setTimeout(() => {
    showResultAnimation.value = false;
  }, 2000);
}

function acceptOffer() {
  merchantStore.acceptHaggleOffer();
  emit('close');
}

function rejectOffer() {
  merchantStore.rejectHaggleOffer();
}

function cancel() {
  merchantStore.cancelHaggle();
  emit('close');
}

function getPriceChangeColor(change: number): string {
  if (change > 0) return 'success';
  if (change < 0) return 'error';
  return 'grey';
}
</script>

<template>
  <v-dialog
    :model-value="merchantStore.isHaggling"
    max-width="700"
    persistent
    @update:model-value="$event || cancel()"
  >
    <v-card v-if="haggle && customer && item">
      <v-card-title class="d-flex align-center bg-amber-darken-3">
        <v-icon
          class="mr-2"
          color="white"
        >
          mdi-handshake
        </v-icon>
        <span class="text-white">Targowanie z {{ customer.name }}</span>
        <v-spacer />
        <v-chip
          size="small"
          color="white"
          variant="outlined"
        >
          Runda {{ haggle.round }} / {{ haggle.maxRounds }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Item being negotiated -->
        <v-card
          variant="outlined"
          class="mb-4"
        >
          <v-card-text class="d-flex align-center">
            <v-avatar
              size="64"
              color="primary"
              class="mr-4"
            >
              <v-icon
                size="32"
                color="white"
              >
                {{ item.icon || 'mdi-cube' }}
              </v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h6">
                {{ item.name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ item.description }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-caption text-medium-emphasis">
                Twoja cena
              </div>
              <div class="text-h5 text-primary">
                {{ haggle.originalPrice }} zł
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Negotiation status -->
        <v-row class="mb-4">
          <!-- Customer offer -->
          <v-col cols="6">
            <v-card
              variant="tonal"
              :color="pricePercent >= 100 ? 'success' : pricePercent >= 80 ? 'warning' : 'error'"
            >
              <v-card-text class="text-center">
                <div class="text-caption text-medium-emphasis mb-1">
                  Oferta klienta
                </div>
                <div class="text-h4 font-weight-bold">
                  {{ haggle.currentOffer }} zł
                </div>
                <div class="text-body-2">
                  <v-chip
                    size="small"
                    :color="pricePercent >= 100 ? 'success' : pricePercent >= 80 ? 'warning' : 'error'"
                  >
                    {{ pricePercent }}% ceny
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Max: {{ maxOfferPercent }}%
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Customer patience -->
          <v-col cols="6">
            <v-card
              variant="tonal"
              :color="patiencePercent >= 60 ? 'success' : patiencePercent >= 30 ? 'warning' : 'error'"
            >
              <v-card-text class="text-center">
                <div class="text-caption text-medium-emphasis mb-1">
                  Cierpliwość klienta
                </div>
                <v-progress-circular
                  :model-value="patiencePercent"
                  :color="patiencePercent >= 60 ? 'success' : patiencePercent >= 30 ? 'warning' : 'error'"
                  :size="80"
                  :width="8"
                >
                  <span class="text-h5 font-weight-bold">{{ patiencePercent }}%</span>
                </v-progress-circular>
                <div class="text-caption text-medium-emphasis mt-2">
                  {{ customer.type === 'whale' ? 'Niecierpliwy bogacz' :
                    customer.type === 'noble' ? 'Wymagający szlachcic' :
                      customer.type === 'collector' ? 'Cierpliwy kolekcjoner' :
                        customer.type === 'merchant' ? 'Doświadczony handlarz' :
                          customer.type === 'traveler' ? 'Spokojny podróżnik' : 'Prosty chłop' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Last tactic result -->
        <v-slide-y-transition>
          <v-alert
            v-if="showResultAnimation && lastTacticResult"
            :type="lastTacticResult.success ? 'success' : 'warning'"
            variant="tonal"
            class="mb-4"
          >
            <div class="d-flex align-center">
              <span>{{ lastTacticResult.message }}</span>
              <v-spacer />
              <v-chip
                v-if="lastTacticResult.priceChange !== 0"
                :color="getPriceChangeColor(lastTacticResult.priceChange)"
                size="small"
              >
                {{ lastTacticResult.priceChange > 0 ? '+' : '' }}{{ lastTacticResult.priceChange }} zł
              </v-chip>
            </div>
          </v-alert>
        </v-slide-y-transition>

        <!-- Tactics -->
        <div class="text-subtitle-2 mb-2">
          Wybierz taktykę targowania
        </div>
        <v-row dense>
          <v-col
            v-for="tactic in tactics"
            :key="tactic.id"
            cols="6"
            md="4"
          >
            <v-card
              class="tactic-card"
              :class="{ 'tactic-disabled': !isTacticAvailable(tactic.id) }"
              :disabled="!isTacticAvailable(tactic.id)"
              @click="useTactic(tactic.id)"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center mb-1">
                  <v-icon
                    :color="isTacticAvailable(tactic.id) ? 'primary' : 'grey'"
                    size="20"
                    class="mr-2"
                  >
                    {{ tactic.icon }}
                  </v-icon>
                  <span class="text-body-2 font-weight-medium">{{ tactic.name }}</span>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ tactic.description }}
                </div>
                <div class="d-flex justify-space-between mt-1">
                  <v-chip
                    size="x-small"
                    :color="tactic.priceGainOnSuccess > 0.2 ? 'success' : 'primary'"
                    variant="tonal"
                  >
                    +{{ Math.round(tactic.priceGainOnSuccess * 100) }}%
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="warning"
                    variant="tonal"
                  >
                    {{ Math.round(tactic.baseSuccessChance * 100) }}% szansa
                  </v-chip>
                </div>
                <div
                  v-if="!isTacticAvailable(tactic.id)"
                  class="text-caption text-error mt-1"
                >
                  Cooldown: {{ getTacticCooldown(tactic.id) }} rundy
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          color="error"
          variant="outlined"
          @click="cancel"
        >
          <v-icon start>
            mdi-close
          </v-icon>
          Anuluj
        </v-btn>
        <v-spacer />
        <v-btn
          color="warning"
          variant="tonal"
          @click="rejectOffer"
        >
          <v-icon start>
            mdi-thumb-down
          </v-icon>
          Odrzuć ofertę
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          @click="acceptOffer"
        >
          <v-icon start>
            mdi-check
          </v-icon>
          Akceptuj {{ haggle.currentOffer }} zł
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.tactic-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.tactic-card:hover:not(.tactic-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tactic-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
