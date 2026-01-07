<template>
  <div class="prestige-panel">
    <!-- Header with ashes display -->
    <div class="prestige-header">
      <div class="ashes-display">
        <v-icon icon="mdi-fire" class="ashes-icon" />
        <span class="ashes-amount">{{ prestigeStore.formattedAshes }}</span>
        <span class="ashes-label">Popiołów Męczenników</span>
      </div>
    </div>

    <!-- Prestige Button Section -->
    <div class="prestige-action">
      <div class="prestige-info">
        <div class="potential-ashes">
          <span class="label">Potencjalne Popioły:</span>
          <span class="value" :class="{ 'can-prestige': prestigeStore.canPrestige }">
            +{{ prestigeStore.formattedPotentialAshes }}
          </span>
        </div>
        <div class="prestige-requirements">
          <span class="label">Wymagania:</span>
          <span class="value">
            1000 Wiary lub 1 fala odparta
          </span>
        </div>
      </div>

      <v-btn
        class="prestige-btn"
        :disabled="!prestigeStore.canPrestige"
        @click="confirmPrestige"
        size="large"
        variant="elevated"
      >
        <v-icon icon="mdi-fire" class="mr-2" />
        PRESTIŻ
      </v-btn>

      <p class="prestige-warning" v-if="prestigeStore.canPrestige">
        ⚠️ To zresetuje całą grę, ale zachowasz Popioły!
      </p>
    </div>

    <!-- Stats Section -->
    <div class="prestige-stats">
      <h3>📊 Statystyki</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Prestiże:</span>
          <span class="stat-value">{{ prestigeStore.stats.totalPrestigeCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Łączne Popioły:</span>
          <span class="stat-value">{{ formatNumber(prestigeStore.stats.totalAshesEarned) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Najwyższa fala:</span>
          <span class="stat-value">{{ prestigeStore.stats.highestWave }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Max Wiara:</span>
          <span class="stat-value">{{ formatNumber(prestigeStore.stats.highestFaith) }}</span>
        </div>
      </div>
    </div>

    <!-- Upgrades Section -->
    <div class="upgrades-section">
      <h3>✨ Ulepszenia Permanentne</h3>

      <!-- Category Tabs -->
      <div class="upgrade-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="tab-btn"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          <v-icon :icon="cat.icon" size="18" />
          {{ cat.name }}
        </button>
      </div>

      <!-- Upgrades Grid -->
      <div class="upgrades-grid">
        <div
          v-for="upgrade in filteredUpgrades"
          :key="upgrade.id"
          class="upgrade-card"
          :class="{
            'can-afford': prestigeStore.canAffordUpgrade(upgrade.id),
            'maxed': prestigeStore.isUpgradeMaxed(upgrade.id)
          }"
        >
          <div class="upgrade-header">
            <v-icon :icon="upgrade.icon" class="upgrade-icon" />
            <div class="upgrade-title">
              <span class="name">{{ upgrade.name }}</span>
              <span class="level">
                Poz. {{ prestigeStore.getUpgradeLevel(upgrade.id) }}/{{ upgrade.maxLevel }}
              </span>
            </div>
          </div>

          <p class="upgrade-description">{{ upgrade.description }}</p>

          <div class="upgrade-effect">
            <span class="current-effect">
              {{ upgrade.effectDescription(prestigeStore.getUpgradeLevel(upgrade.id)) }}
            </span>
            <span class="next-effect" v-if="!prestigeStore.isUpgradeMaxed(upgrade.id)">
              → {{ upgrade.effectDescription(prestigeStore.getUpgradeLevel(upgrade.id) + 1) }}
            </span>
          </div>

          <v-btn
            class="upgrade-btn"
            :disabled="!prestigeStore.canAffordUpgrade(upgrade.id) || prestigeStore.isUpgradeMaxed(upgrade.id)"
            @click="purchaseUpgrade(upgrade.id)"
            size="small"
            variant="tonal"
          >
            <template v-if="prestigeStore.isUpgradeMaxed(upgrade.id)">
              MAX
            </template>
            <template v-else>
              <v-icon icon="mdi-fire" size="14" class="mr-1" />
              {{ formatNumber(prestigeStore.getUpgradeCost(upgrade.id)) }}
            </template>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Current Bonuses Section -->
    <div class="bonuses-section" v-if="hasAnyBonuses">
      <h3>🛡️ Aktywne Bonusy</h3>
      <div class="bonuses-grid">
        <div class="bonus-item" v-if="bonuses.startingFaith > 0">
          <v-icon icon="mdi-cross-outline" />
          <span>+{{ bonuses.startingFaith }} Wiary na start</span>
        </div>
        <div class="bonus-item" v-if="bonuses.productionMultiplier > 1">
          <v-icon icon="mdi-arrow-up-bold" />
          <span>+{{ Math.round((bonuses.productionMultiplier - 1) * 100) }}% produkcji</span>
        </div>
        <div class="bonus-item" v-if="bonuses.clickMultiplier > 1">
          <v-icon icon="mdi-hand-heart" />
          <span>+{{ Math.round((bonuses.clickMultiplier - 1) * 100) }}% z modlitwy</span>
        </div>
        <div class="bonus-item" v-if="bonuses.buildingCostReduction > 0">
          <v-icon icon="mdi-sale" />
          <span>-{{ Math.round(bonuses.buildingCostReduction * 100) }}% kosztu budynków</span>
        </div>
        <div class="bonus-item" v-if="bonuses.unitLossReduction > 0">
          <v-icon icon="mdi-shield-account" />
          <span>-{{ Math.round(bonuses.unitLossReduction * 100) }}% strat jednostek</span>
        </div>
        <div class="bonus-item" v-if="bonuses.threatGrowthReduction > 0">
          <v-icon icon="mdi-castle" />
          <span>-{{ Math.round(bonuses.threatGrowthReduction * 100) }}% wzrostu zagrożenia</span>
        </div>
        <div class="bonus-item" v-if="bonuses.moraleRegenBonus > 0">
          <v-icon icon="mdi-heart-pulse" />
          <span>+{{ bonuses.moraleRegenBonus.toFixed(1) }}/s regeneracji morale</span>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card class="prestige-dialog">
        <v-card-title class="dialog-title">
          <v-icon icon="mdi-fire" class="mr-2" />
          Potwierdź Prestiż
        </v-card-title>
        <v-card-text>
          <p>Czy na pewno chcesz wykonać Prestiż?</p>
          <p class="dialog-warning">
            <strong>Stracisz:</strong> Całą Wiarę, wszystkie budynki, postęp fal
          </p>
          <p class="dialog-gain">
            <strong>Zyskasz:</strong> +{{ prestigeStore.formattedPotentialAshes }} Popiołów Męczenników
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showConfirmDialog = false" variant="text">
            Anuluj
          </v-btn>
          <v-btn @click="executePrestige" color="orange" variant="elevated">
            <v-icon icon="mdi-fire" class="mr-1" />
            Prestiż!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePrestigeStore } from '~/stores/solmar-sanctuary/prestige';
import { formatNumber } from '~/shared/lib/big-number';

const prestigeStore = usePrestigeStore();

const showConfirmDialog = ref(false);
const selectedCategory = ref<'production' | 'combat' | 'utility'>('production');

const categories = [
  { id: 'production' as const, name: 'Produkcja', icon: 'mdi-arrow-up-bold' },
  { id: 'combat' as const, name: 'Walka', icon: 'mdi-sword-cross' },
  { id: 'utility' as const, name: 'Narzędzia', icon: 'mdi-wrench' },
];

const filteredUpgrades = computed(() => {
  return prestigeStore.upgrades.filter(u => u.category === selectedCategory.value);
});

const bonuses = computed(() => prestigeStore.prestigeBonuses);

const hasAnyBonuses = computed(() => {
  const b = bonuses.value;
  return b.startingFaith > 0 ||
    b.productionMultiplier > 1 ||
    b.clickMultiplier > 1 ||
    b.buildingCostReduction > 0 ||
    b.unitLossReduction > 0 ||
    b.threatGrowthReduction > 0 ||
    b.moraleRegenBonus > 0;
});

function confirmPrestige() {
  if (prestigeStore.canPrestige) {
    showConfirmDialog.value = true;
  }
}

function executePrestige() {
  prestigeStore.performPrestige();
  showConfirmDialog.value = false;
}

function purchaseUpgrade(upgradeId: string) {
  prestigeStore.purchaseUpgrade(upgradeId);
}
</script>

<style scoped lang="scss">
.prestige-panel {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 100%;
  overflow-y: auto;
}

.prestige-header {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.2), rgba(255, 69, 0, 0.3));
  border-radius: 12px;
  border: 1px solid rgba(255, 140, 0, 0.4);
}

.ashes-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  .ashes-icon {
    font-size: 2rem;
    color: #ff8c00;
    animation: flame-pulse 2s ease-in-out infinite;
  }

  .ashes-amount {
    font-size: 2rem;
    font-weight: bold;
    color: #ff8c00;
    text-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
  }

  .ashes-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
}

@keyframes flame-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.prestige-action {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;

  .prestige-info {
    margin-bottom: 1rem;

    .potential-ashes, .prestige-requirements {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .label {
        color: rgba(255, 255, 255, 0.6);
      }

      .value {
        font-weight: bold;
        color: rgba(255, 255, 255, 0.8);

        &.can-prestige {
          color: #ff8c00;
          text-shadow: 0 0 8px rgba(255, 140, 0, 0.5);
        }
      }
    }
  }

  .prestige-btn {
    background: linear-gradient(135deg, #ff8c00, #ff4500) !important;
    color: white !important;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 0.75rem 2rem;

    &:disabled {
      background: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.3) !important;
    }

    &:not(:disabled):hover {
      box-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
    }
  }

  .prestige-warning {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: #ffa500;
  }
}

.prestige-stats {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;

  h3 {
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 4px;

      .stat-label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
      }

      .stat-value {
        font-weight: bold;
        color: #ff8c00;
      }
    }
  }
}

.upgrades-section {
  h3 {
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .upgrade-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: rgba(255, 140, 0, 0.2);
        border-color: rgba(255, 140, 0, 0.4);
        color: #ff8c00;
      }
    }
  }

  .upgrades-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .upgrade-card {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.2s;

    &.can-afford {
      border-color: rgba(255, 140, 0, 0.4);
      background: rgba(255, 140, 0, 0.05);
    }

    &.maxed {
      opacity: 0.6;
      border-color: rgba(0, 255, 0, 0.3);
    }

    .upgrade-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .upgrade-icon {
        font-size: 1.5rem;
        color: #ff8c00;
      }

      .upgrade-title {
        flex: 1;

        .name {
          display: block;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.9);
        }

        .level {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .upgrade-description {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 0.5rem;
    }

    .upgrade-effect {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;

      .current-effect {
        color: #4caf50;
      }

      .next-effect {
        color: #ff8c00;
      }
    }

    .upgrade-btn {
      width: 100%;
      background: rgba(255, 140, 0, 0.2) !important;
      color: #ff8c00 !important;

      &:disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        color: rgba(255, 255, 255, 0.3) !important;
      }
    }
  }
}

.bonuses-section {
  padding: 1rem;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 8px;

  h3 {
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #4caf50;
  }

  .bonuses-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .bonus-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: rgba(0, 255, 0, 0.1);
      border-radius: 4px;
      font-size: 0.8rem;
      color: #4caf50;

      .v-icon {
        font-size: 1rem;
      }
    }
  }
}

.prestige-dialog {
  background: #1e1e1e !important;

  .dialog-title {
    color: #ff8c00;
  }

  .dialog-warning {
    color: #ff6b6b;
    margin: 0.5rem 0;
  }

  .dialog-gain {
    color: #4caf50;
  }
}
</style>

