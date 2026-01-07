<template>
  <v-card class="combat-panel">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon icon="mdi-sword-cross" class="mr-2" />
      <span>Linia Frontu</span>
      <v-spacer />
      <v-chip
        v-if="difficultyLevel > 1"
        color="warning"
        variant="tonal"
        size="small"
        class="mr-2"
      >
        Poziom {{ difficultyLevel }}
      </v-chip>
      <v-chip
        v-if="isUnderAttack"
        color="error"
        variant="flat"
        size="small"
        class="pulse-animation"
      >
        <v-icon icon="mdi-alert" size="14" class="mr-1" />
        ATAK!
      </v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Morale Bar -->
      <div class="stat-row mb-3">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="stat-label">
            <v-icon icon="mdi-shield-account" size="16" class="mr-1" />
            Morale
          </span>
          <span class="stat-value" :class="moraleColorClass">
            {{ formattedMorale }} / 100
            <span class="text-caption text-success ml-1">({{ formattedMoraleRegen }})</span>
          </span>
        </div>
        <v-progress-linear
          :model-value="moralePercent"
          :color="moraleColor"
          bg-color="surface-variant"
          height="12"
          class="morale-bar"
        />
        <div class="d-flex align-center justify-space-between mt-1">
          <span class="text-caption text-medium-emphasis">
            {{ moraleStatusText }}
          </span>
          <v-chip
            size="x-small"
            :color="moralePercent >= 50 ? 'success' : moralePercent >= 25 ? 'warning' : 'error'"
            variant="flat"
          >
            <v-icon icon="mdi-arrow-up" size="12" class="mr-1" />
            {{ formattedMoraleBonus }}
          </v-chip>
        </div>
      </div>

      <!-- Threat Bar -->
      <div class="stat-row mb-3">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="stat-label">
            <v-icon icon="mdi-skull" size="16" class="mr-1" />
            Zagrożenie
          </span>
          <span class="stat-value text-error">
            {{ formattedThreat }} / 100
          </span>
        </div>
        <v-progress-linear
          :model-value="threatPercent"
          color="error"
          bg-color="surface-variant"
          height="12"
          class="threat-bar"
        />
        <div class="text-caption text-medium-emphasis mt-1">
          Następna fala: <strong>{{ nextWaveName }}</strong> (za {{ timeUntilWaveDisplay }})
        </div>
      </div>

      <!-- Defense Stats -->
      <div class="defense-stats mb-3">
        <div class="d-flex flex-wrap gap-3">
          <v-chip
            size="small"
            :color="defenseRating > 0 ? 'info' : 'default'"
            variant="tonal"
          >
            <v-icon icon="mdi-shield" size="14" class="mr-1" />
            Obrona: {{ formattedDefenseRating }}
          </v-chip>
          <v-chip
            v-if="threatReductionPercent > 0"
            size="small"
            color="purple"
            variant="tonal"
          >
            <v-icon icon="mdi-arrow-down" size="14" class="mr-1" />
            Zagrożenie: -{{ threatReductionPercent }}%
          </v-chip>
        </div>
      </div>

      <!-- Combo Display -->
      <div v-if="combo.currentStreak > 0" class="combo-display mb-3">
        <v-chip
          :color="combo.currentStreak >= 5 ? 'warning' : combo.currentStreak >= 3 ? 'info' : 'success'"
          variant="elevated"
          size="small"
          class="combo-chip"
        >
          <v-icon icon="mdi-fire" size="14" class="mr-1" :class="{ 'combo-fire': combo.currentStreak >= 3 }" />
          SERIA x{{ combo.currentStreak }}
          <span class="ml-1 text-caption">(+{{ Math.round(combo.currentStreak * combo.bonusPerStreak * 100) }}% obrony)</span>
        </v-chip>
        <v-chip v-if="combo.maxStreak > 0" size="x-small" variant="text" class="ml-2">
          Rekord: x{{ combo.maxStreak }}
        </v-chip>
      </div>

      <!-- Wave Info (when active) -->
      <v-alert
        v-if="isUnderAttack && activeWave"
        :type="activeWave.isBoss ? 'error' : 'warning'"
        variant="tonal"
        class="mb-3 wave-alert"
        :class="{ 'boss-alert': activeWave.isBoss }"
        density="compact"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <span class="enemy-icon mr-2 shake-animation" :class="{ 'boss-icon': activeWave.isBoss }">
              {{ currentEnemy?.icon || '⚔️' }}
            </span>
            <div>
              <strong>{{ currentEnemy?.name || currentWaveName }}</strong>
              <v-chip
                v-if="currentEnemy"
                :color="enemyTierColor"
                size="x-small"
                class="ml-1"
                variant="flat"
              >
                {{ enemyTierLabel }}
              </v-chip>
              <span v-if="difficultyLevel > 1" class="text-caption ml-1">(x{{ waveStrengthDisplay }})</span>
              <div class="text-caption">
                {{ currentEnemy?.description }}
              </div>
              <div v-if="currentEnemy?.weakness" class="text-caption text-info">
                <v-icon icon="mdi-lightning-bolt" size="12" />
                Słabość: {{ getWeaknessName(currentEnemy.weakness) }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-h6 font-weight-bold">{{ waveTimeDisplay }}s</div>
          </div>
        </div>
      </v-alert>

      <!-- Simple Wave Alert (fallback) -->
      <v-alert
        v-else-if="isUnderAttack"
        type="error"
        variant="tonal"
        class="mb-3 wave-alert"
        density="compact"
      >
        <div class="d-flex align-center">
          <v-icon icon="mdi-sword" class="mr-2 shake-animation" />
          <div>
            <strong>{{ currentWaveName }}</strong>
            <span v-if="difficultyLevel > 1" class="text-caption ml-1">(x{{ waveStrengthDisplay }})</span>
            <div class="text-caption">
              Czas pozostały: {{ waveTimeDisplay }}s
            </div>
          </div>
        </div>
      </v-alert>

      <!-- Boss Encounter Panel -->
      <v-card
        v-if="activeBossEncounter"
        class="boss-encounter mb-3"
        color="error"
        variant="outlined"
      >
        <v-card-title class="d-flex align-center justify-space-between py-2">
          <div class="d-flex align-center">
            <span class="boss-icon mr-2">{{ currentEnemy?.icon || '👑' }}</span>
            <div>
              <span class="text-h6">{{ currentEnemy?.name || 'BOSS' }}</span>
              <v-chip size="x-small" color="white" class="ml-2">
                Faza {{ activeBossEncounter.phase }}/{{ activeBossEncounter.maxPhases }}
              </v-chip>
            </div>
          </div>
          <v-chip color="error" variant="flat">
            HP: {{ Math.max(0, activeBossEncounter.healthPercent) }}%
          </v-chip>
        </v-card-title>

        <v-progress-linear
          :model-value="activeBossEncounter.healthPercent"
          color="error"
          height="8"
          class="boss-health-bar"
        />

        <v-card-text>
          <div class="text-overline mb-2">Wybierz Akcję:</div>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              v-for="choice in activeBossEncounter.choices"
              :key="choice.id"
              :color="choice.id === 'sacrifice' ? 'error' : 'warning'"
              variant="elevated"
              size="small"
              :disabled="!canAffordBossChoice(choice)"
              class="boss-choice-btn"
              @click="executeBossChoice(choice.id)"
            >
              <span class="mr-1">{{ choice.icon }}</span>
              {{ choice.name }}
              <v-tooltip activator="parent" location="top">
                <div class="text-center" style="max-width: 200px;">
                  <div>{{ choice.description }}</div>
                  <div class="text-caption mt-1">
                    <span v-if="choice.cost.faith">Koszt: {{ choice.cost.faith }} Wiary</span>
                    <span v-if="choice.cost.ducats"> + {{ choice.cost.ducats }} Dukatów</span>
                  </div>
                  <div class="text-success text-caption">
                    Efekt: -{{ choice.effect.value }}% HP
                  </div>
                </div>
              </v-tooltip>
            </v-btn>
          </div>

          <div class="text-caption text-medium-emphasis mt-2">
            <v-icon icon="mdi-gift" size="14" class="mr-1" />
            Nagrody:
            <span v-for="(reward, idx) in activeBossEncounter.rewards" :key="idx">
              <span v-if="reward.type === 'relic'">{{ reward.relicRarity }} relikwia</span>
              <span v-if="reward.type === 'ashes'">+{{ reward.amount }} Popiołów</span>
              <span v-if="idx < activeBossEncounter.rewards.length - 1">, </span>
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Defense Abilities -->
      <div class="defense-section">
        <div class="text-overline mb-2">Liturgia Obronna</div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            v-for="defense in defenses"
            :key="defense.id"
            :disabled="!canActivateDefense(defense.id)"
            :color="activeDefenseId === defense.id ? 'success' : getDefenseUsageColor(defense.id)"
            variant="outlined"
            size="small"
            class="defense-btn"
            @click="activateDefense(defense.id)"
          >
            <v-icon :icon="defense.icon" size="18" class="mr-1" />
            {{ defense.name }}
            <span v-if="defenseUsageCounts[defense.id] > 0" class="ml-1 text-caption">
              (x{{ defenseUsageCounts[defense.id] + 1 }})
            </span>
            <v-tooltip activator="parent" location="top">
              <div class="text-center" style="max-width: 220px;">
                <div>{{ defense.description }}</div>
                <div class="text-caption mt-1" :class="defenseUsageCounts[defense.id] > 0 ? 'text-warning' : ''">
                  Koszt: {{ getFormattedDefenseCost(defense.id) }} Wiary
                  <span v-if="defenseUsageCounts[defense.id] > 0">
                    (baza: {{ formatNumber(defense.faithCost) }})
                  </span>
                </div>
                <div class="text-caption">
                  Czas: {{ defense.duration }}s | CD: {{ defense.cooldown }}s
                </div>
                <div v-if="defenseUsageCounts[defense.id] > 0" class="text-caption text-info mt-1">
                  Użyć: {{ defenseUsageCounts[defense.id] }} | Koszt spada co 2min
                </div>
              </div>
            </v-tooltip>
          </v-btn>
        </div>
        <div v-if="defenseCooldown > 0" class="text-caption text-warning mt-2">
          <v-icon icon="mdi-timer-sand" size="14" class="mr-1" />
          Cooldown: {{ Math.ceil(defenseCooldown) }}s
        </div>
        <div v-if="isDefenseActive" class="text-caption text-success mt-2">
          <v-icon icon="mdi-shield-check" size="14" class="mr-1" />
          {{ activeDefenseName }} aktywne: {{ Math.ceil(defenseTimeRemaining) }}s
        </div>
      </div>

      <!-- Stats -->
      <v-divider class="my-3" />
      <div class="d-flex flex-wrap justify-space-between text-caption text-medium-emphasis gap-2">
        <span>
          <v-icon icon="mdi-wave" size="14" class="mr-1" />
          Fale: {{ wavesDefeated }}
        </span>
        <span v-if="bossesDefeated > 0">
          <v-icon icon="mdi-skull-crossbones" size="14" class="mr-1" color="error" />
          Bossy: {{ bossesDefeated }}
        </span>
        <span v-if="megaBossesDefeated > 0">
          <v-icon icon="mdi-crown" size="14" class="mr-1" color="warning" />
          Mega: {{ megaBossesDefeated }}
        </span>
        <span>
          <v-icon icon="mdi-grave-stone" size="14" class="mr-1" />
          Straty: {{ totalUnitsLost }}
        </span>
      </div>
    </v-card-text>

  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCombatStore } from '~/stores/solmar-sanctuary/combat';
import { useResourceStore } from '~/stores/solmar-sanctuary/resources';
import { formatNumber } from '~/shared/lib/big-number';
import type { BossChoice } from '~/shared/types/game.types';

const combatStore = useCombatStore();
const resourceStore = useResourceStore();

const {
  threatPercent,
  moralePercent,
  formattedThreat,
  formattedMorale,
  formattedMoraleRegen,
  formattedDefenseRating,
  formattedMoraleBonus,
  waveTimeRemaining,
  timeUntilNextWave,
  nextWave,
  isDefenseActive,
  defenseTimeRemaining,
  defenseCooldown,
  activeDefenseId,
  wavesDefeated,
  totalUnitsLost,
  isUnderAttack,
  defenseRating,
  threatReduction,
  difficultyLevel,
  waveStrengthMultiplier,
  defenseUsageCounts,
  // Extended combat
  currentEnemyType,
  combo,
  activeBossEncounter,
  activeWave,
  bossesDefeated,
  megaBossesDefeated,
} = storeToRefs(combatStore);

// defenses is a plain array, not a ref - access directly
const defenses = combatStore.defenses;
const ENEMY_TYPES = combatStore.ENEMY_TYPES;
const { canActivateDefense, activateDefense, getFormattedDefenseCost, executeBossChoice } = combatStore;

// Current enemy computed
const currentEnemy = computed(() => {
  if (!currentEnemyType.value) return null;
  return ENEMY_TYPES[currentEnemyType.value];
});

// Enemy tier display
const enemyTierLabel = computed(() => {
  if (!currentEnemy.value) return '';
  const labels: Record<string, string> = {
    basic: 'Podstawowy',
    elite: 'Elita',
    special: 'Specjalny',
    boss: 'BOSS',
    megaboss: 'MEGA BOSS',
  };
  return labels[currentEnemy.value.tier] || currentEnemy.value.tier;
});

const enemyTierColor = computed(() => {
  if (!currentEnemy.value) return 'default';
  const colors: Record<string, string> = {
    basic: 'grey',
    elite: 'warning',
    special: 'purple',
    boss: 'error',
    megaboss: 'black',
  };
  return colors[currentEnemy.value.tier] || 'default';
});

// Get weakness name
function getWeaknessName(weaknessId: string | undefined): string {
  if (!weaknessId) return '';
  const defense = defenses.find(d => d.id === weaknessId);
  return defense?.name || weaknessId;
}

// Check if player can afford boss choice
function canAffordBossChoice(choice: BossChoice): boolean {
  for (const [resourceId, amount] of Object.entries(choice.cost)) {
    const resource = resourceStore.resources[resourceId as keyof typeof resourceStore.resources];
    if (!resource?.amount.gte(amount || 0)) {
      return false;
    }
  }
  return true;
}

// Computed
const moraleColor = computed(() => {
  const percent = moralePercent.value;
  if (percent > 60) return 'success';
  if (percent > 30) return 'warning';
  return 'error';
});

const moraleColorClass = computed(() => {
  const percent = moralePercent.value;
  if (percent > 60) return 'text-success';
  if (percent > 30) return 'text-warning';
  return 'text-error';
});

const moraleStatusText = computed(() => {
  const percent = moralePercent.value;
  if (percent > 80) return 'Morale wysokie - maksymalna produktywność!';
  if (percent > 60) return 'Morale stabilne - dobra produktywność';
  if (percent > 40) return 'Morale spada - produktywność obniżona';
  if (percent > 20) return '⚠️ Morale niskie - niska produktywność!';
  return '☠️ MORALE KRYTYCZNE - minimalna produktywność!';
});

const nextWaveName = computed(() => nextWave.value?.name || 'Nieznane');
const currentWaveName = computed(() => nextWave.value?.name || 'Atak');

const timeUntilWaveDisplay = computed(() => {
  const seconds = Math.ceil(timeUntilNextWave.value);
  if (seconds > 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
});

const waveTimeDisplay = computed(() => Math.ceil(waveTimeRemaining.value));

const threatReductionPercent = computed(() => Math.round(threatReduction.value * 100));

const waveStrengthDisplay = computed(() => {
  const scaling = 1 + Math.floor(wavesDefeated.value / 5) * 0.1;
  const difficulty = 1 + (difficultyLevel.value - 1) * 0.2;
  return (scaling * difficulty * waveStrengthMultiplier.value).toFixed(1);
});

const activeDefenseName = computed(() => {
  if (!activeDefenseId.value) return '';
  const defense = defenses.find(d => d.id === activeDefenseId.value);
  return defense?.name || '';
});

/**
 * Get button color based on defense usage count (more expensive = more warning)
 */
function getDefenseUsageColor(defenseId: string): string {
  const usageCount = defenseUsageCounts.value[defenseId] || 0;
  if (usageCount >= 3) return 'error'; // Very expensive
  if (usageCount >= 2) return 'warning'; // Expensive
  if (usageCount >= 1) return 'info'; // Slightly more expensive
  return 'primary'; // Base cost
}
</script>

<style scoped lang="scss">
.combat-panel {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      rgb(var(--v-theme-error)) 0%,
      rgb(var(--v-theme-warning)) 50%,
      rgb(var(--v-theme-success)) 100%
    );
  }
}

.stat-label {
  font-family: var(--font-lore-solmar);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.stat-value {
  font-family: var(--font-body-solmar);
  font-weight: 700;
}

.morale-bar {
  border-radius: 2px;

  :deep(.v-progress-linear__determinate) {
    transition: width 0.5s ease;
  }
}

.threat-bar {
  border-radius: 2px;

  :deep(.v-progress-linear__determinate) {
    transition: width 0.3s ease;
  }
}

.defense-stats {
  padding: 8px 0;
}

.wave-alert {
  animation: pulse-border 1s ease-in-out infinite;
}

.defense-btn {
  text-transform: none;
  font-weight: 600;
}

.defense-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 4px;
  padding: 12px;
}

.cycle-end-card {
  background: linear-gradient(
    135deg,
    rgba(139, 0, 0, 0.95) 0%,
    rgba(50, 0, 0, 0.98) 100%
  ) !important;
}

// Animations
.pulse-animation {
  animation: pulse 1s ease-in-out infinite;
}

.shake-animation {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--v-theme-error), 0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

// Combo display
.combo-display {
  display: flex;
  align-items: center;
}

.combo-chip {
  animation: combo-pulse 1s ease-in-out infinite;
}

.combo-fire {
  animation: fire-flicker 0.3s ease-in-out infinite;
}

@keyframes combo-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 8px 2px rgba(var(--v-theme-warning), 0.3);
  }
}

@keyframes fire-flicker {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

// Enemy display
.enemy-icon {
  font-size: 1.5rem;
}

.boss-icon {
  font-size: 2rem;
  animation: boss-glow 1s ease-in-out infinite;
}

.boss-alert {
  border: 2px solid rgb(var(--v-theme-error));
  animation: boss-border-pulse 1s ease-in-out infinite;
}

@keyframes boss-glow {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(var(--v-theme-error), 0.6));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(var(--v-theme-error), 0.9));
  }
}

@keyframes boss-border-pulse {
  0%, 100% {
    border-color: rgb(var(--v-theme-error));
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4);
  }
  50% {
    border-color: rgb(var(--v-theme-warning));
    box-shadow: 0 0 15px 5px rgba(var(--v-theme-error), 0.2);
  }
}

// Boss encounter panel
.boss-encounter {
  background: linear-gradient(
    135deg,
    rgba(139, 0, 0, 0.15) 0%,
    rgba(50, 0, 0, 0.2) 100%
  ) !important;
  border-width: 2px !important;
  animation: boss-card-pulse 2s ease-in-out infinite;
}

@keyframes boss-card-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(var(--v-theme-error), 0.2);
  }
}

.boss-health-bar {
  :deep(.v-progress-linear__determinate) {
    transition: width 0.3s ease;
  }
}

.boss-choice-btn {
  text-transform: none;
  font-weight: 600;

  &:not(:disabled) {
    animation: choice-glow 2s ease-in-out infinite;
  }
}

@keyframes choice-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(var(--v-theme-warning), 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(var(--v-theme-warning), 0.5);
  }
}
</style>
