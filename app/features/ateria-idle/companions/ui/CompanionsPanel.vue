<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaCompanionsStore } from '../model/companions.store';
import {
  COMPANIONS, COMPANION_TASKS, COMPANION_CLASSES, RARITY_DATA, RELATIONSHIP_LEVELS,
  getCompanion, getTask, getRelationshipLevel, type CompanionClass
} from '../data/companions.data';

const companionsStore = useAteriaCompanionsStore();

const activeTab = ref<'roster' | 'recruit' | 'tasks' | 'stats'>('roster');
const selectedCompanion = ref<string | null>(null);
const selectedTaskType = ref<string | null>(null);

const selectedCompanionFull = computed(() => {
  if (!selectedCompanion.value) return null;
  const data = companionsStore.getCompanionData(selectedCompanion.value);
  if (!data) return null;
  const base = getCompanion(selectedCompanion.value);
  if (!base) return null;
  return { ...base, ...data };
});

const filteredTasks = computed(() => {
  if (!selectedTaskType.value) return COMPANION_TASKS;
  return COMPANION_TASKS.filter(t => t.type === selectedTaskType.value);
});

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const relationshipLevelNames: Record<string, string> = {
  stranger: 'Nieznajomy',
  acquaintance: 'Znajomy',
  friend: 'Przyjaciel',
  trusted: 'Zaufany',
  devoted: 'Oddany',
  soulbound: 'Połączony Duszą',
};
</script>

<template>
  <div class="companions-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="orange-darken-2" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-account-group</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5">Towarzysze</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ companionsStore.recruitedCount }} / {{ companionsStore.maxCompanions }} towarzyszy
            </div>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ companionsStore.recruitedCount }}</div>
            <div class="text-caption">Zrekrutowanych</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ companionsStore.busyCompanions.length }}</div>
            <div class="text-caption">Na zadaniach</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ companionsStore.stats.totalTasksCompleted }}</div>
            <div class="text-caption">Ukończ. zadań</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ companionsStore.stats.totalGiftsGiven }}</div>
            <div class="text-caption">Prezentów</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="orange" class="mb-4">
      <v-tab value="roster">
        <v-icon start>mdi-account-multiple</v-icon>
        Drużyna ({{ companionsStore.recruitedCount }})
      </v-tab>
      <v-tab value="recruit">
        <v-icon start>mdi-account-plus</v-icon>
        Rekrutuj
      </v-tab>
      <v-tab value="tasks">
        <v-icon start>mdi-clipboard-list</v-icon>
        Zadania
      </v-tab>
      <v-tab value="stats">
        <v-icon start>mdi-chart-bar</v-icon>
        Statystyki
      </v-tab>
    </v-tabs>

    <!-- Roster Tab -->
    <div v-if="activeTab === 'roster'">
      <v-row v-if="companionsStore.companionList.length > 0">
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Twoi Towarzysze</v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="companion in companionsStore.companionList"
                  :key="companion.companionId"
                  :active="selectedCompanion === companion.companionId"
                  @click="selectedCompanion = companion.companionId"
                >
                  <template #prepend>
                    <v-avatar :color="COMPANION_CLASSES[companion.class].color" size="40">
                      <v-icon color="white">{{ companion.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ companion.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Lvl {{ companion.level }} • {{ COMPANION_CLASSES[companion.class].name }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip v-if="companionsStore.activeTasks.has(companion.companionId)" size="x-small" color="warning">
                      Zajęty
                    </v-chip>
                    <v-chip v-else size="x-small" color="success">
                      Wolny
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card v-if="selectedCompanionFull">
            <v-card-title class="d-flex align-center">
              <v-avatar :color="COMPANION_CLASSES[selectedCompanionFull.class].color" size="56" class="mr-3">
                <v-icon size="32" color="white">{{ selectedCompanionFull.icon }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div>{{ selectedCompanionFull.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ selectedCompanionFull.title }}</div>
              </div>
              <div class="text-right">
                <v-chip :color="RARITY_DATA[selectedCompanionFull.rarity].color" size="small">
                  {{ RARITY_DATA[selectedCompanionFull.rarity].name }}
                </v-chip>
                <div class="text-caption mt-1">Poziom {{ selectedCompanionFull.level }}</div>
              </div>
            </v-card-title>

            <v-divider />

            <v-card-text>
              <div class="text-body-2 mb-3">{{ selectedCompanionFull.description }}</div>
              <div class="text-caption font-italic mb-4">"{{ selectedCompanionFull.lore }}"</div>

              <!-- XP Progress -->
              <div class="mb-4">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Doświadczenie</span>
                  <span>{{ selectedCompanionFull.xp }} / {{ selectedCompanionFull.xpToNextLevel }}</span>
                </div>
                <v-progress-linear
                  :model-value="(selectedCompanionFull.xp / selectedCompanionFull.xpToNextLevel) * 100"
                  color="amber"
                  height="8"
                  rounded
                />
              </div>

              <!-- Relationship -->
              <div class="mb-4">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Relacja: {{ relationshipLevelNames[getRelationshipLevel(selectedCompanionFull.relationshipPoints).level] }}</span>
                  <span>{{ selectedCompanionFull.relationshipPoints }} pkt</span>
                </div>
                <v-progress-linear
                  :model-value="Math.min(100, (selectedCompanionFull.relationshipPoints / 15000) * 100)"
                  color="pink"
                  height="8"
                  rounded
                />
              </div>

              <!-- Stats -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Statystyki</div>
                <v-row dense>
                  <v-col v-for="(value, stat) in selectedCompanionFull.baseStats" :key="stat" cols="4">
                    <v-chip size="small" variant="outlined" class="w-100">
                      {{ stat }}: {{ value + selectedCompanionFull.level }}
                    </v-chip>
                  </v-col>
                </v-row>
              </div>

              <!-- Skills -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Umiejętności</div>
                <v-list density="compact">
                  <v-list-item
                    v-for="skill in selectedCompanionFull.skills"
                    :key="skill.id"
                    :class="{ 'opacity-50': selectedCompanionFull.level < skill.unlockLevel }"
                  >
                    <template #prepend>
                      <v-icon :color="selectedCompanionFull.level >= skill.unlockLevel ? 'success' : 'grey'">
                        {{ skill.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ skill.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ skill.description }}</v-list-item-subtitle>
                    <template #append>
                      <v-chip v-if="selectedCompanionFull.level < skill.unlockLevel" size="x-small" color="grey">
                        Lvl {{ skill.unlockLevel }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <!-- Active Task -->
              <div v-if="companionsStore.activeTasks.has(selectedCompanionFull.companionId)" class="mb-4">
                <div class="text-subtitle-2 mb-2">Aktywne Zadanie</div>
                <v-card variant="outlined" color="warning">
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2">{{ getTask(companionsStore.getActiveTask(selectedCompanionFull.companionId)?.taskId || '')?.icon }}</v-icon>
                      <span>{{ getTask(companionsStore.getActiveTask(selectedCompanionFull.companionId)?.taskId || '')?.name }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="companionsStore.getTaskProgress(selectedCompanionFull.companionId)"
                      color="warning"
                      height="12"
                      rounded
                    >
                      <template #default>
                        {{ companionsStore.getTaskProgress(selectedCompanionFull.companionId).toFixed(0) }}%
                      </template>
                    </v-progress-linear>
                    <v-btn
                      color="error"
                      variant="text"
                      size="small"
                      class="mt-2"
                      @click="companionsStore.cancelTask(selectedCompanionFull.companionId)"
                    >
                      Anuluj
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Actions -->
              <div class="d-flex gap-2">
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="companionsStore.dismiss(selectedCompanionFull.companionId); selectedCompanion = null"
                >
                  Zwolnij
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-else>
            <v-card-text class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-arrow-left</v-icon>
              <div>Wybierz towarzysza z listy</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else>
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="64" class="mb-2">mdi-account-question</v-icon>
          <div class="text-h6">Brak towarzyszy</div>
          <div>Przejdź do zakładki "Rekrutuj", aby znaleźć towarzyszy!</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Recruit Tab -->
    <div v-if="activeTab === 'recruit'">
      <v-row>
        <v-col v-for="companion in companionsStore.availableCompanions" :key="companion.id" cols="12" md="6" lg="4">
          <v-card :style="{ borderLeft: `4px solid ${RARITY_DATA[companion.rarity].color}` }">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar :color="COMPANION_CLASSES[companion.class].color" size="56">
                  <v-icon size="32" color="white">{{ companion.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-h6">{{ companion.name }}</div>
                  <div class="text-caption">{{ companion.title }}</div>
                </div>
                <v-chip :color="RARITY_DATA[companion.rarity].color" size="small">
                  {{ RARITY_DATA[companion.rarity].name }}
                </v-chip>
              </div>

              <div class="text-body-2 mb-3">{{ companion.description }}</div>

              <div class="d-flex flex-wrap gap-1 mb-3">
                <v-chip size="x-small" :color="COMPANION_CLASSES[companion.class].color">
                  {{ COMPANION_CLASSES[companion.class].name }}
                </v-chip>
                <v-chip v-for="task in companion.preferredTasks" :key="task" size="x-small" variant="outlined">
                  {{ task }}
                </v-chip>
              </div>

              <v-alert type="info" density="compact" variant="tonal" class="mb-3">
                <div class="text-caption">{{ companion.recruitRequirement.description }}</div>
              </v-alert>

              <v-btn
                block
                :color="companionsStore.canRecruit(companion.id).canRecruit ? 'success' : 'grey'"
                :disabled="!companionsStore.canRecruit(companion.id).canRecruit"
                @click="companionsStore.recruit(companion.id)"
              >
                <v-icon start>mdi-account-plus</v-icon>
                {{ companionsStore.canRecruit(companion.id).canRecruit ? 'Rekrutuj' : companionsStore.canRecruit(companion.id).reason }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Tasks Tab -->
    <div v-if="activeTab === 'tasks'">
      <v-card class="mb-4">
        <v-card-text>
          <v-chip-group v-model="selectedTaskType">
            <v-chip :value="null" filter>Wszystkie</v-chip>
            <v-chip value="combat" filter color="red">Walka</v-chip>
            <v-chip value="gathering" filter color="green">Zbieranie</v-chip>
            <v-chip value="crafting" filter color="brown">Rzemiosło</v-chip>
            <v-chip value="trading" filter color="amber">Handel</v-chip>
            <v-chip value="research" filter color="blue">Badania</v-chip>
            <v-chip value="exploration" filter color="cyan">Eksploracja</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col v-for="task in filteredTasks" :key="task.id" cols="12" md="6" lg="4">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar color="primary" size="40">
                  <v-icon color="white">{{ task.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-subtitle-1">{{ task.name }}</div>
                  <div class="text-caption">{{ formatDuration(task.duration) }}</div>
                </div>
                <v-chip size="small" variant="outlined">{{ task.successRateBase }}% baza</v-chip>
              </div>

              <div class="text-body-2 mb-3">{{ task.description }}</div>

              <div class="d-flex flex-wrap gap-1 mb-3">
                <v-chip size="x-small" color="amber">+{{ task.rewards.companionXp }} XP</v-chip>
                <v-chip v-if="task.rewards.playerRewards?.gold" size="x-small" color="warning">
                  +{{ task.rewards.playerRewards.gold }}g
                </v-chip>
                <v-chip v-if="task.rewards.relationshipPoints" size="x-small" color="pink">
                  +{{ task.rewards.relationshipPoints }} rel
                </v-chip>
              </div>

              <v-select
                v-if="companionsStore.idleCompanions.length > 0"
                :items="companionsStore.idleCompanions"
                item-title="name"
                item-value="companionId"
                label="Przydziel towarzysza"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="(id) => companionsStore.startTask(id, task.id)"
              />
              <v-chip v-else color="grey" class="w-100">
                Brak wolnych towarzyszy
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Statystyki Ogólne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-account-multiple</v-icon></template>
                  <v-list-item-title>Łącznie zrekrutowanych</v-list-item-title>
                  <template #append>{{ companionsStore.stats.totalRecruited }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                  <v-list-item-title>Ukończonych zadań</v-list-item-title>
                  <template #append>{{ companionsStore.stats.totalTasksCompleted }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="pink">mdi-gift</v-icon></template>
                  <v-list-item-title>Danych prezentów</v-list-item-title>
                  <template #append>{{ companionsStore.stats.totalGiftsGiven }}</template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Klasy Towarzyszy</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="(info, classId) in COMPANION_CLASSES"
                  :key="classId"
                  :color="info.color"
                  variant="outlined"
                >
                  <v-icon start>{{ info.icon }}</v-icon>
                  {{ info.name }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
</style>
