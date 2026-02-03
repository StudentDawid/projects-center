<script setup lang="ts">
/**
 * Diplomat Panel - Factions, Reputation, Missions
 */

import { computed, ref } from 'vue';
import { useAteriaDiplomatStore } from '../model/diplomat.store';
import {
  FACTIONS,
  DIPLOMAT_MISSIONS,
  REPUTATION_THRESHOLDS,
  getReputationTier,
  calculateMissionSuccessChance,
  type FactionId,
  type DiplomatMission,
} from '../data/diplomat.data';

const diplomatStore = useAteriaDiplomatStore();

// UI State
const activeTab = ref<'factions' | 'missions' | 'titles'>('factions');
const selectedFaction = ref<FactionId | null>(null);
const selectedMission = ref<DiplomatMission | null>(null);

// Computed
const sortedFactions = computed(() => {
  return [...diplomatStore.factionData].sort((a, b) => b.reputation - a.reputation);
});

const missionsByType = computed(() => {
  const missions = diplomatStore.availableMissions;
  return {
    negotiation: missions.filter(m => m.type === 'negotiation'),
    alliance: missions.filter(m => m.type === 'alliance'),
    trade_deal: missions.filter(m => m.type === 'trade_deal'),
    espionage: missions.filter(m => m.type === 'espionage'),
    arbitration: missions.filter(m => m.type === 'arbitration'),
  };
});

// Actions
function startMission(mission: DiplomatMission) {
  diplomatStore.startMission(mission.id);
}

function getMissionTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    negotiation: 'mdi-handshake',
    alliance: 'mdi-account-group',
    trade_deal: 'mdi-cart-arrow-right',
    espionage: 'mdi-incognito',
    arbitration: 'mdi-scale-balance',
  };
  return icons[type] || 'mdi-help';
}

function getMissionTypeName(type: string): string {
  const names: Record<string, string> = {
    negotiation: 'Negocjacje',
    alliance: 'Sojusze',
    trade_deal: 'Umowy Handlowe',
    espionage: 'Szpiegostwo',
    arbitration: 'Arbitraż',
  };
  return names[type] || type;
}

function getSuccessChance(mission: DiplomatMission): number {
  return calculateMissionSuccessChance(mission, diplomatStore.stats);
}

function isMissionOnCooldown(missionId: string): boolean {
  const cooldownEnd = diplomatStore.missionCooldowns.get(missionId);
  return cooldownEnd !== undefined && cooldownEnd > Date.now();
}

function getCooldownRemaining(missionId: string): string {
  const cooldownEnd = diplomatStore.missionCooldowns.get(missionId);
  if (!cooldownEnd) return '';
  const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
  return `${remaining}s`;
}
</script>

<template>
  <div class="diplomat-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="indigo"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-account-tie
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Dyplomata</span>
              <v-chip
                size="small"
                color="indigo"
              >
                Poziom {{ diplomatStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Polityka, frakcje i wpływy
            </div>
            <v-progress-linear
              :model-value="diplomatStore.getXpProgress()"
              color="indigo"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ diplomatStore.progress.xp }} / {{ diplomatStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
          <div class="text-center ml-4">
            <div class="text-h4 text-amber">
              {{ diplomatStore.influence }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Wpływy
            </div>
          </div>
        </div>

        <!-- Stats -->
        <v-row class="mt-3">
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ diplomatStore.stats.charisma }}
            </div>
            <div class="text-caption">
              Charyzma
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ diplomatStore.stats.persuasion }}
            </div>
            <div class="text-caption">
              Perswazja
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ diplomatStore.stats.intrigue }}
            </div>
            <div class="text-caption">
              Intryga
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ diplomatStore.stats.renown }}
            </div>
            <div class="text-caption">
              Renoma
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Mission -->
    <v-card
      v-if="diplomatStore.isOnMission && diplomatStore.currentMission"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="primary"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ diplomatStore.currentMission.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              {{ diplomatStore.currentMission.name }}
            </div>
            <v-progress-linear
              :model-value="diplomatStore.missionProgress"
              color="success"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(diplomatStore.missionProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="diplomatStore.cancelMission()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="indigo"
      class="mb-4"
    >
      <v-tab value="factions">
        <v-icon start>
          mdi-flag
        </v-icon>
        Frakcje
      </v-tab>
      <v-tab value="missions">
        <v-icon start>
          mdi-briefcase
        </v-icon>
        Misje
      </v-tab>
      <v-tab value="titles">
        <v-icon start>
          mdi-crown
        </v-icon>
        Tytuły
      </v-tab>
    </v-tabs>

    <!-- Factions Tab -->
    <div v-if="activeTab === 'factions'">
      <v-row>
        <v-col
          v-for="faction in sortedFactions"
          :key="faction.id"
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  :color="faction.color"
                  size="48"
                  class="mr-3"
                >
                  <v-icon color="white">
                    {{ faction.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6">
                    {{ faction.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ faction.leader }} • {{ faction.location }}
                  </div>
                </div>
                <v-chip
                  :color="faction.tierColor"
                  size="small"
                >
                  {{ faction.tierLabel }}
                </v-chip>
              </div>

              <div class="text-body-2 mb-3">
                {{ faction.description }}
              </div>

              <div class="d-flex align-center mb-2">
                <span class="text-caption mr-2">Reputacja:</span>
                <v-progress-linear
                  :model-value="(faction.reputation + 100) / 2"
                  :color="faction.tierColor"
                  height="12"
                  rounded
                  class="flex-grow-1"
                >
                  <template #default>
                    {{ faction.reputation }}
                  </template>
                </v-progress-linear>
              </div>

              <!-- Bonuses -->
              <div
                v-if="faction.bonuses.length > 0"
                class="mt-2"
              >
                <div class="text-caption text-medium-emphasis mb-1">
                  Bonusy:
                </div>
                <v-chip
                  v-for="(bonus, idx) in faction.bonuses"
                  :key="idx"
                  size="x-small"
                  :color="REPUTATION_THRESHOLDS[bonus.tier].color"
                  class="mr-1 mb-1"
                  variant="outlined"
                >
                  {{ bonus.tier }}: {{ bonus.description }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Missions Tab -->
    <div v-if="activeTab === 'missions'">
      <v-row>
        <v-col
          v-for="(missions, type) in missionsByType"
          :key="type"
          cols="12"
          md="6"
        >
          <v-card v-if="missions.length > 0">
            <v-card-title class="d-flex align-center">
              <v-icon
                :color="type === 'espionage' ? 'grey' : 'primary'"
                class="mr-2"
              >
                {{ getMissionTypeIcon(type) }}
              </v-icon>
              {{ getMissionTypeName(type) }}
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="mission in missions"
                  :key="mission.id"
                  :disabled="diplomatStore.isOnMission || isMissionOnCooldown(mission.id)"
                >
                  <template #prepend>
                    <v-avatar size="36">
                      <v-icon>{{ mission.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ mission.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Lvl {{ mission.requiredLevel }} •
                    {{ (mission.duration / 10).toFixed(0) }}s •
                    {{ getSuccessChance(mission).toFixed(0) }}% szansy
                  </v-list-item-subtitle>
                  <template #append>
                    <v-btn
                      v-if="isMissionOnCooldown(mission.id)"
                      size="small"
                      variant="text"
                      disabled
                    >
                      {{ getCooldownRemaining(mission.id) }}
                    </v-btn>
                    <v-btn
                      v-else
                      size="small"
                      color="primary"
                      variant="tonal"
                      :disabled="diplomatStore.isOnMission"
                      @click="startMission(mission)"
                    >
                      Start
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-alert
        v-if="diplomatStore.availableMissions.length === 0"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        Brak dostępnych misji. Zwiększ poziom lub reputację z frakcjami.
      </v-alert>
    </div>

    <!-- Titles Tab -->
    <div v-if="activeTab === 'titles'">
      <v-card>
        <v-card-title>Odblokowane Tytuły</v-card-title>
        <v-card-text>
          <v-list v-if="diplomatStore.unlockedTitles.length > 0">
            <v-list-item
              v-for="titleId in diplomatStore.unlockedTitles"
              :key="titleId"
              :class="{ 'bg-primary-lighten-5': diplomatStore.activeTitle === titleId }"
              @click="diplomatStore.setActiveTitle(titleId)"
            >
              <template #prepend>
                <v-icon color="amber">
                  mdi-crown
                </v-icon>
              </template>
              <v-list-item-title>{{ diplomatStore.getTitleName(titleId) }}</v-list-item-title>
              <template #append>
                <v-chip
                  v-if="diplomatStore.activeTitle === titleId"
                  size="small"
                  color="primary"
                >
                  Aktywny
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-4 text-medium-emphasis"
          >
            Brak odblokowanych tytułów. Osiągnij status Sojusznika z frakcjami.
          </div>
        </v-card-text>
      </v-card>

      <!-- Mission History -->
      <v-card class="mt-4">
        <v-card-title>Historia Misji</v-card-title>
        <v-card-text>
          <v-list
            v-if="diplomatStore.missionHistory.length > 0"
            density="compact"
          >
            <v-list-item
              v-for="(result, idx) in diplomatStore.missionHistory.slice(0, 10)"
              :key="idx"
            >
              <template #prepend>
                <v-icon :color="result.success ? 'success' : 'error'">
                  {{ result.success ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ DIPLOMAT_MISSIONS[result.missionId]?.name || result.missionId }}
              </v-list-item-title>
              <v-list-item-subtitle>
                +{{ result.xpGained }} XP, +{{ result.influenceGained }} wpływów
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-4 text-medium-emphasis"
          >
            Brak ukończonych misji
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.bg-primary-lighten-5 {
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
