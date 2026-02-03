<script setup lang="ts">
/**
 * Mystic Panel - Meditation, Prophecies, Rituals, Tarot
 */

import { computed, ref } from 'vue';
import { useAteriaMysticStore } from '../model/mystic.store';
import {
  PROPHECIES,
  RITUALS,
  MAJOR_ARCANA,
  TRANCE_EFFECTS,
  getProphecyTypeName,
  getProphecyTypeIcon,
  type ProphecyType,
} from '../data/mystic.data';

const mysticStore = useAteriaMysticStore();

// UI State
const activeTab = ref<'meditation' | 'prophecies' | 'rituals' | 'tarot'>('meditation');

// Computed
const propheciesByType = computed(() => {
  const grouped: Record<ProphecyType, typeof mysticStore.availablePropheciesList.value> = {
    market: [],
    weather: [],
    combat: [],
    danger: [],
    political: [],
    discovery: [],
  };

  for (const prophecy of mysticStore.availablePropheciesList) {
    grouped[prophecy.type].push(prophecy);
  }

  return grouped;
});

const ritualsByTier = computed(() => {
  const grouped: Record<number, typeof mysticStore.availableRitualsList.value> = {};

  for (const ritual of mysticStore.availableRitualsList) {
    if (!grouped[ritual.tier]) grouped[ritual.tier] = [];
    grouped[ritual.tier].push(ritual);
  }

  return grouped;
});

// Actions
function isProphecyOnCooldown(prophecyId: string): boolean {
  const cooldownEnd = mysticStore.prophecyCooldowns.get(prophecyId);
  return cooldownEnd !== undefined && cooldownEnd > Date.now();
}

function getProphecyCooldownRemaining(prophecyId: string): string {
  const cooldownEnd = mysticStore.prophecyCooldowns.get(prophecyId);
  if (!cooldownEnd) return '';
  const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
  return remaining > 60 ? `${Math.ceil(remaining / 60)}m` : `${remaining}s`;
}

function isRitualOnCooldown(ritualId: string): boolean {
  const cooldownEnd = mysticStore.ritualCooldowns.get(ritualId);
  return cooldownEnd !== undefined && cooldownEnd > Date.now();
}

function getRitualCooldownRemaining(ritualId: string): string {
  const cooldownEnd = mysticStore.ritualCooldowns.get(ritualId);
  if (!cooldownEnd) return '';
  const remaining = Math.ceil((cooldownEnd - Date.now()) / 60000);
  return `${remaining}m`;
}

function formatDuration(ticks: number): string {
  const seconds = ticks / 10;
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  return `${(seconds / 60).toFixed(1)}m`;
}
</script>

<template>
  <div class="mystic-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="deep-purple"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-crystal-ball
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Mistyk</span>
              <v-chip
                size="small"
                color="deep-purple"
              >
                Poziom {{ mysticStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Medytacja, przepowiednie i rytuały
            </div>
            <v-progress-linear
              :model-value="mysticStore.getXpProgress()"
              color="deep-purple"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ mysticStore.progress.xp }} / {{ mysticStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <!-- Resources -->
        <v-row class="mt-3">
          <v-col
            cols="4"
            class="text-center"
          >
            <div class="d-flex align-center justify-center">
              <v-icon
                color="blue"
                class="mr-1"
              >
                mdi-water
              </v-icon>
              <span class="text-h6">{{ mysticStore.progress.mana.toFixed(0) }}</span>
              <span class="text-caption text-medium-emphasis">/{{ mysticStore.progress.maxMana }}</span>
            </div>
            <v-progress-linear
              :model-value="mysticStore.manaPercent"
              color="blue"
              height="6"
              rounded
              class="mt-1"
            />
            <div class="text-caption">
              Mana
            </div>
          </v-col>
          <v-col
            cols="4"
            class="text-center"
          >
            <div class="d-flex align-center justify-center">
              <v-icon
                color="amber"
                class="mr-1"
              >
                mdi-star-four-points
              </v-icon>
              <span class="text-h6">{{ mysticStore.progress.enlightenment.toFixed(0) }}</span>
            </div>
            <div class="text-caption">
              Oświecenie
            </div>
          </v-col>
          <v-col
            cols="4"
            class="text-center"
          >
            <div class="d-flex align-center justify-center">
              <v-icon
                color="purple"
                class="mr-1"
              >
                mdi-meditation
              </v-icon>
              <span class="text-h6">{{ mysticStore.currentMeditationLevel.name }}</span>
            </div>
            <div class="text-caption">
              Lvl {{ mysticStore.currentMeditationLevel.level }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Trance -->
    <v-card
      v-if="mysticStore.activeTrance"
      class="mb-4"
      :color="TRANCE_EFFECTS[mysticStore.activeTrance.type].color"
      variant="tonal"
    >
      <v-card-text>
        <div class="d-flex align-center">
          <v-icon
            size="36"
            class="mr-3"
          >
            {{ TRANCE_EFFECTS[mysticStore.activeTrance.type].icon }}
          </v-icon>
          <div class="flex-grow-1">
            <div class="text-h6">
              {{ TRANCE_EFFECTS[mysticStore.activeTrance.type].name }}
            </div>
            <div class="text-body-2">
              {{ TRANCE_EFFECTS[mysticStore.activeTrance.type].description }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Active Ritual -->
    <v-card
      v-if="mysticStore.isCastingRitual && mysticStore.activeRitual"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="purple"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ RITUALS[mysticStore.activeRitual.ritualId]?.icon || 'mdi-magic-staff' }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              {{ RITUALS[mysticStore.activeRitual.ritualId]?.name }}
            </div>
            <v-progress-linear
              :model-value="mysticStore.ritualProgress"
              color="purple"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(mysticStore.ritualProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="mysticStore.cancelRitual()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Daily Tarot -->
    <v-card
      v-if="mysticStore.dailyTarot"
      class="mb-4"
      variant="outlined"
    >
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            :color="mysticStore.dailyTarot.bonus.isNegative ? 'error' : 'success'"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ mysticStore.dailyTarot.card.icon }}
            </v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              Karta Dnia: {{ mysticStore.dailyTarot.card.name }}
              <span
                v-if="mysticStore.dailyTarot.reversed"
                class="text-caption text-error"
              >(odwrócona)</span>
            </div>
            <div class="text-body-2">
              {{ mysticStore.dailyTarot.bonus.description }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="deep-purple"
      class="mb-4"
    >
      <v-tab value="meditation">
        <v-icon start>
          mdi-meditation
        </v-icon>
        Medytacja
      </v-tab>
      <v-tab value="prophecies">
        <v-icon start>
          mdi-eye
        </v-icon>
        Przepowiednie
      </v-tab>
      <v-tab value="rituals">
        <v-icon start>
          mdi-pentagram
        </v-icon>
        Rytuały
      </v-tab>
      <v-tab value="tarot">
        <v-icon start>
          mdi-cards
        </v-icon>
        Tarot
      </v-tab>
    </v-tabs>

    <!-- Meditation Tab -->
    <div v-if="activeTab === 'meditation'">
      <v-card>
        <v-card-text>
          <div class="text-center py-6">
            <v-avatar
              :color="mysticStore.isMeditating ? 'deep-purple' : 'grey'"
              size="120"
              class="mb-4"
            >
              <v-icon
                size="64"
                color="white"
              >
                mdi-meditation
              </v-icon>
            </v-avatar>

            <div class="text-h5 mb-2">
              {{ mysticStore.currentMeditationLevel.name }}
            </div>

            <v-progress-linear
              :model-value="mysticStore.meditationProgress"
              color="deep-purple"
              height="12"
              rounded
              class="mb-4 mx-auto"
              style="max-width: 300px;"
            >
              <template #default>
                {{ mysticStore.meditationProgress.toFixed(0) }}%
              </template>
            </v-progress-linear>

            <div class="text-body-2 text-medium-emphasis mb-4">
              <div>Mana/tick: +{{ mysticStore.currentMeditationLevel.manaPerTick }}</div>
              <div>Oświecenie/tick: +{{ mysticStore.currentMeditationLevel.enlightenmentPerTick }}</div>
              <div>Szansa na trans: {{ mysticStore.currentMeditationLevel.tranceChance }}%</div>
            </div>

            <v-btn
              v-if="!mysticStore.isMeditating"
              color="deep-purple"
              size="large"
              @click="mysticStore.startMeditation()"
            >
              <v-icon start>
                mdi-play
              </v-icon>
              Rozpocznij Medytację
            </v-btn>
            <v-btn
              v-else
              color="error"
              size="large"
              @click="mysticStore.stopMeditation()"
            >
              <v-icon start>
                mdi-stop
              </v-icon>
              Zakończ Medytację
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Active Bonuses -->
      <v-card
        v-if="Object.keys(mysticStore.totalActiveBonuses).length > 0"
        class="mt-4"
      >
        <v-card-title>Aktywne Bonusy</v-card-title>
        <v-card-text>
          <v-chip
            v-for="(value, type) in mysticStore.totalActiveBonuses"
            :key="type"
            class="ma-1"
            :color="value > 0 ? 'success' : 'error'"
          >
            {{ type }}: {{ value > 0 ? '+' : '' }}{{ value }}%
          </v-chip>
        </v-card-text>
      </v-card>
    </div>

    <!-- Prophecies Tab -->
    <div v-if="activeTab === 'prophecies'">
      <!-- Active Prophecies -->
      <v-card
        v-if="mysticStore.activeProphecies.length > 0"
        class="mb-4"
      >
        <v-card-title>Aktywne Przepowiednie</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item
              v-for="active in mysticStore.activeProphecies"
              :key="active.prophecyId"
            >
              <template #prepend>
                <v-avatar size="36">
                  <v-icon>{{ PROPHECIES[active.prophecyId]?.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ PROPHECIES[active.prophecyId]?.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ active.prediction?.message }} • Dokładność: {{ active.accuracy }}%
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Available Prophecies -->
      <v-row>
        <v-col
          v-for="(prophecies, type) in propheciesByType"
          :key="type"
          cols="12"
          md="6"
        >
          <v-card v-if="prophecies.length > 0">
            <v-card-title class="d-flex align-center">
              <v-icon
                :color="type === 'combat' ? 'red' : 'purple'"
                class="mr-2"
              >
                {{ getProphecyTypeIcon(type as ProphecyType) }}
              </v-icon>
              {{ getProphecyTypeName(type as ProphecyType) }}
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="prophecy in prophecies"
                  :key="prophecy.id"
                >
                  <v-list-item-title>{{ prophecy.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ prophecy.manaCost }} mana • {{ prophecy.enlightenmentCost }} ośw. •
                    {{ formatDuration(prophecy.duration) }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-btn
                      v-if="isProphecyOnCooldown(prophecy.id)"
                      size="small"
                      variant="text"
                      disabled
                    >
                      {{ getProphecyCooldownRemaining(prophecy.id) }}
                    </v-btn>
                    <v-btn
                      v-else
                      size="small"
                      color="purple"
                      variant="tonal"
                      :disabled="!mysticStore.canCastProphecy(prophecy.id).canCast"
                      @click="mysticStore.castProphecy(prophecy.id)"
                    >
                      Rzuć
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-alert
        v-if="mysticStore.availablePropheciesList.length === 0"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        Brak dostępnych przepowiedni. Zwiększ poziom Mistyka.
      </v-alert>
    </div>

    <!-- Rituals Tab -->
    <div v-if="activeTab === 'rituals'">
      <!-- Active Ritual Effects -->
      <v-card
        v-if="mysticStore.activeRitualEffects.length > 0"
        class="mb-4"
      >
        <v-card-title>Aktywne Efekty Rytuałów</v-card-title>
        <v-card-text>
          <v-chip
            v-for="(effect, idx) in mysticStore.activeRitualEffects"
            :key="idx"
            class="ma-1"
            color="purple"
          >
            {{ RITUALS[effect.ritualId]?.name }}
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- Available Rituals -->
      <v-row>
        <v-col
          v-for="(rituals, tier) in ritualsByTier"
          :key="tier"
          cols="12"
        >
          <v-card>
            <v-card-title>
              Tier {{ tier }}
              <v-chip
                v-for="i in Number(tier)"
                :key="i"
                size="x-small"
                color="amber"
                class="ml-1"
              >
                ⭐
              </v-chip>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="ritual in rituals"
                  :key="ritual.id"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="d-flex align-center mb-2">
                        <v-avatar
                          color="deep-purple"
                          size="48"
                        >
                          <v-icon color="white">
                            {{ ritual.icon }}
                          </v-icon>
                        </v-avatar>
                        <div class="ml-3">
                          <div class="text-subtitle-1 font-weight-medium">
                            {{ ritual.name }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Lvl {{ ritual.requiredLevel }}
                          </div>
                        </div>
                      </div>

                      <div class="text-body-2 mb-3">
                        {{ ritual.description }}
                      </div>

                      <div class="text-caption text-medium-emphasis mb-2">
                        <div>Koszt: {{ ritual.manaCost }} mana, {{ ritual.enlightenmentCost }} ośw.</div>
                        <div>Czas: {{ formatDuration(ritual.castTime) }} • Efekt: {{ formatDuration(ritual.effectDuration) }}</div>
                      </div>

                      <div class="mb-2">
                        <v-chip
                          v-for="effect in ritual.effects"
                          :key="effect.type"
                          size="small"
                          color="success"
                          class="mr-1"
                        >
                          {{ effect.description }}
                        </v-chip>
                      </div>

                      <v-btn
                        v-if="isRitualOnCooldown(ritual.id)"
                        size="small"
                        variant="text"
                        disabled
                        block
                      >
                        Cooldown: {{ getRitualCooldownRemaining(ritual.id) }}
                      </v-btn>
                      <v-btn
                        v-else
                        size="small"
                        color="deep-purple"
                        :disabled="mysticStore.isCastingRitual || !mysticStore.canStartRitual(ritual.id).canStart"
                        block
                        @click="mysticStore.startRitual(ritual.id)"
                      >
                        Odpraw Rytuał
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Tarot Tab -->
    <div v-if="activeTab === 'tarot'">
      <!-- Draw Card -->
      <v-card class="mb-4">
        <v-card-text class="text-center py-6">
          <v-avatar
            color="deep-purple"
            size="100"
            class="mb-4"
          >
            <v-icon
              size="56"
              color="white"
            >
              mdi-cards
            </v-icon>
          </v-avatar>

          <div class="text-h5 mb-2">
            Karty Tarota
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Wylosuj dzienną kartę, która da ci bonus na cały dzień
          </div>

          <v-btn
            color="deep-purple"
            size="large"
            :disabled="!mysticStore.canDrawTarot"
            @click="mysticStore.drawDailyTarot()"
          >
            <v-icon start>
              mdi-cards-playing
            </v-icon>
            {{ mysticStore.canDrawTarot ? 'Losuj Kartę' : 'Karta wylosowana' }}
          </v-btn>

          <div class="text-caption mt-4">
            Zebrane karty: {{ mysticStore.collectedCards.size }} / {{ MAJOR_ARCANA.length }}
          </div>
        </v-card-text>
      </v-card>

      <!-- Collection -->
      <v-card>
        <v-card-title>Kolekcja Kart</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="card in MAJOR_ARCANA"
              :key="card.id"
              cols="4"
              sm="3"
              md="2"
            >
              <v-tooltip :text="card.name">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    :color="mysticStore.collectedCards.has(card.id) ? 'deep-purple' : 'grey-lighten-2'"
                    size="56"
                    class="ma-1"
                  >
                    <v-icon
                      :color="mysticStore.collectedCards.has(card.id) ? 'white' : 'grey'"
                    >
                      {{ mysticStore.collectedCards.has(card.id) ? card.icon : 'mdi-help' }}
                    </v-icon>
                  </v-avatar>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Stats -->
      <v-card class="mt-4">
        <v-card-title>Statystyki</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="4"
              class="text-center"
            >
              <div class="text-h5">
                {{ mysticStore.tarotDrawsTotal }}
              </div>
              <div class="text-caption">
                Losowania
              </div>
            </v-col>
            <v-col
              cols="4"
              class="text-center"
            >
              <div class="text-h5">
                {{ mysticStore.fulfilledProphecies }}
              </div>
              <div class="text-caption">
                Spełnione przepowiednie
              </div>
            </v-col>
            <v-col
              cols="4"
              class="text-center"
            >
              <div class="text-h5">
                {{ mysticStore.ritualsCompleted }}
              </div>
              <div class="text-caption">
                Rytuały
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
