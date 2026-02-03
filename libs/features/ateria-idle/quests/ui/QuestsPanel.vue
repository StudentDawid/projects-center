<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaQuestsStore } from '../model/quests.store';
import { QUESTS, QUEST_TYPE_DATA, getQuest, type QuestType } from '../data/quests.data';

const questsStore = useAteriaQuestsStore();
const activeTab = ref<'active' | 'available' | 'completed'>('active');
const selectedType = ref<QuestType | 'all'>('all');
const selectedQuest = ref<string | null>(null);

const filteredAvailable = computed(() => {
  if (selectedType.value === 'all') return questsStore.availableQuests;
  return questsStore.availableQuests.filter(q => q.type === selectedType.value);
});

const selectedQuestData = computed(() => {
  if (!selectedQuest.value) return null;
  return getQuest(selectedQuest.value);
});

const selectedActiveQuest = computed(() => {
  if (!selectedQuest.value) return null;
  return questsStore.activeQuests.get(selectedQuest.value);
});

function selectQuest(questId: string) {
  selectedQuest.value = selectedQuest.value === questId ? null : questId;
}
</script>

<template>
  <div class="quests-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="deep-purple" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-book-open-variant</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Questy</span>
              <v-chip size="small" color="deep-purple">{{ questsStore.activeQuestsList.length }} aktywne</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Zadania fabularne i codzienne</div>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ questsStore.totalQuestsCompleted }}</div>
            <div class="text-caption">Ukończonych</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ questsStore.mainQuestsCompleted }}</div>
            <div class="text-caption">Główne</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ questsStore.dailyQuestsCompleted }}</div>
            <div class="text-caption">Codzienne</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ questsStore.completedQuests.size }}</div>
            <div class="text-caption">Unikalne</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="deep-purple" class="mb-4">
      <v-tab value="active">
        <v-icon start>mdi-play-circle</v-icon>
        Aktywne ({{ questsStore.activeQuestsList.length }})
      </v-tab>
      <v-tab value="available">
        <v-icon start>mdi-clipboard-list</v-icon>
        Dostępne ({{ questsStore.availableQuests.length }})
      </v-tab>
      <v-tab value="completed">
        <v-icon start>mdi-check-circle</v-icon>
        Ukończone ({{ questsStore.completedQuests.size }})
      </v-tab>
    </v-tabs>

    <!-- Active Quests -->
    <div v-if="activeTab === 'active'">
      <v-card v-if="questsStore.activeQuestsList.length === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-clipboard-text-outline</v-icon>
          <div>Brak aktywnych questów</div>
          <div class="text-caption">Przyjmij quest z zakładki "Dostępne"</div>
        </v-card-text>
      </v-card>

      <v-row v-else>
        <v-col v-for="active in questsStore.activeQuestsList" :key="active.questId" cols="12" md="6">
          <v-card
            :variant="selectedQuest === active.questId ? 'elevated' : 'outlined'"
            :class="{ 'border-success': active.status === 'completed' }"
            @click="selectQuest(active.questId)"
            style="cursor: pointer"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="QUEST_TYPE_DATA[active.quest.type].color" size="40">
                  <v-icon color="white" size="20">{{ active.quest.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-subtitle-1 font-weight-medium">{{ active.quest.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ QUEST_TYPE_DATA[active.quest.type].name }}
                    <v-chip v-if="active.status === 'completed'" size="x-small" color="success" class="ml-2">
                      Gotowy!
                    </v-chip>
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-3">{{ active.quest.description }}</div>

              <!-- Objectives -->
              <div class="mb-3">
                <div v-for="obj in active.quest.objectives" :key="obj.id" class="mb-2">
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span>{{ obj.description }}</span>
                    <span>{{ active.objectives[obj.id] || 0 }}/{{ obj.amount }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="((active.objectives[obj.id] || 0) / obj.amount) * 100"
                    :color="(active.objectives[obj.id] || 0) >= obj.amount ? 'success' : 'primary'"
                    height="6"
                    rounded
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex gap-2">
                <v-btn
                  v-if="active.status === 'completed'"
                  color="success"
                  variant="flat"
                  size="small"
                  @click.stop="questsStore.completeQuest(active.questId)"
                >
                  <v-icon start>mdi-gift</v-icon>
                  Odbierz nagrody
                </v-btn>
                <v-btn
                  color="error"
                  variant="tonal"
                  size="small"
                  @click.stop="questsStore.abandonQuest(active.questId)"
                >
                  Porzuć
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Available Quests -->
    <div v-if="activeTab === 'available'">
      <v-chip-group v-model="selectedType" mandatory class="mb-4">
        <v-chip value="all" variant="outlined">Wszystkie</v-chip>
        <v-chip
          v-for="(data, type) in QUEST_TYPE_DATA"
          :key="type"
          :value="type"
          :color="data.color"
          variant="outlined"
        >
          <v-icon start size="small">{{ data.icon }}</v-icon>
          {{ data.name }}
        </v-chip>
      </v-chip-group>

      <v-card v-if="filteredAvailable.length === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-lock</v-icon>
          <div>Brak dostępnych questów tego typu</div>
          <div class="text-caption">Ukończ inne questy lub rozwijaj ścieżki</div>
        </v-card-text>
      </v-card>

      <v-row v-else>
        <v-col v-for="quest in filteredAvailable" :key="quest.id" cols="12" md="6" lg="4">
          <v-card
            :variant="selectedQuest === quest.id ? 'elevated' : 'outlined'"
            @click="selectQuest(quest.id)"
            style="cursor: pointer"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="QUEST_TYPE_DATA[quest.type].color" size="40">
                  <v-icon color="white" size="20">{{ quest.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ quest.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ QUEST_TYPE_DATA[quest.type].name }}
                    <span v-if="quest.chapter"> • Rozdział {{ quest.chapter }}</span>
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">{{ quest.description }}</div>

              <!-- Objectives preview -->
              <div class="text-caption text-medium-emphasis mb-2">
                <v-icon size="small">mdi-target</v-icon>
                {{ quest.objectives.length }} cel{{ quest.objectives.length > 1 ? 'e/ów' : '' }}
              </div>

              <!-- Rewards preview -->
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip
                  v-for="(reward, idx) in quest.rewards.slice(0, 3)"
                  :key="idx"
                  size="x-small"
                  color="amber"
                  variant="outlined"
                >
                  {{ reward.description }}
                </v-chip>
              </div>

              <v-btn
                block
                color="deep-purple"
                size="small"
                :disabled="!questsStore.canAcceptQuest(quest.id).canAccept"
                @click.stop="questsStore.acceptQuest(quest.id)"
              >
                <v-icon start>mdi-plus</v-icon>
                Przyjmij
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Completed Quests -->
    <div v-if="activeTab === 'completed'">
      <v-card v-if="questsStore.completedQuests.size === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-trophy-outline</v-icon>
          <div>Brak ukończonych questów</div>
        </v-card-text>
      </v-card>

      <v-list v-else>
        <v-list-item
          v-for="questId in questsStore.completedQuests"
          :key="questId"
        >
          <template #prepend>
            <v-avatar :color="QUEST_TYPE_DATA[getQuest(questId)?.type || 'side'].color" size="40">
              <v-icon color="white">{{ getQuest(questId)?.icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ getQuest(questId)?.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ QUEST_TYPE_DATA[getQuest(questId)?.type || 'side'].name }}
          </v-list-item-subtitle>
          <template #append>
            <v-icon color="success">mdi-check-circle</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- Quest Detail Dialog -->
    <v-dialog v-model="selectedQuest" max-width="600" v-if="selectedQuestData && activeTab !== 'active'">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-avatar :color="QUEST_TYPE_DATA[selectedQuestData.type].color" size="40" class="mr-3">
            <v-icon color="white">{{ selectedQuestData.icon }}</v-icon>
          </v-avatar>
          {{ selectedQuestData.name }}
        </v-card-title>
        <v-card-text>
          <div v-if="selectedQuestData.lore" class="text-body-1 font-italic mb-4">
            "{{ selectedQuestData.lore }}"
          </div>
          <div class="text-body-2 mb-4">{{ selectedQuestData.description }}</div>

          <v-divider class="mb-4" />

          <div class="text-subtitle-2 mb-2">Cele:</div>
          <div v-for="obj in selectedQuestData.objectives" :key="obj.id" class="mb-2">
            <v-icon size="small" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
            {{ obj.description }} ({{ obj.amount }})
          </div>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 mb-2">Nagrody:</div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="(reward, idx) in selectedQuestData.rewards"
              :key="idx"
              color="amber"
              variant="outlined"
            >
              {{ reward.description }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="!questsStore.activeQuests.has(selectedQuestData.id) && !questsStore.completedQuests.has(selectedQuestData.id)"
            color="deep-purple"
            :disabled="!questsStore.canAcceptQuest(selectedQuestData.id).canAccept"
            @click="questsStore.acceptQuest(selectedQuestData.id); selectedQuest = null"
          >
            Przyjmij quest
          </v-btn>
          <v-btn variant="text" @click="selectedQuest = null">Zamknij</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
  border-width: 2px !important;
}
</style>
