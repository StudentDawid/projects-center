<script setup lang="ts">
/**
 * Gathering Panel - Mining, Woodcutting, Fishing, Herbalism
 */

import { computed, ref } from 'vue';
import { useAteriaGatheringStore } from '../model/gathering.store';
import {
  GATHERING_SKILLS,
  ALL_GATHERING_RESOURCES,
  getGatheringResource,
  type GatheringSkill,
} from '../data/gathering.data';
import { ALL_TOOLS, getToolsByType, type ToolType } from '../data/tools.data';

const gatheringStore = useAteriaGatheringStore();

// UI State
const activeSkill = ref<GatheringSkill>('mining');
const showToolsDialog = ref(false);

// Computed
const currentSkillData = computed(() => GATHERING_SKILLS[activeSkill.value]);
const currentSkillProgress = computed(() => gatheringStore.skills[activeSkill.value]);
const currentPower = computed(() => gatheringStore.skillPowers[activeSkill.value]);
const availableResources = computed(() => gatheringStore.availableResourcesBySkill[activeSkill.value]);

const toolType = computed<ToolType>(() => {
  switch (activeSkill.value) {
    case 'mining': return 'pickaxe';
    case 'woodcutting': return 'axe';
    case 'fishing': return 'fishing_rod';
    case 'herbalism': return 'sickle';
  }
});

const equippedTool = computed(() => gatheringStore.equippedToolData[toolType.value]);
const ownedTools = computed(() => {
  const tools: Array<{ id: string; tool: any; durability: number; maxDurability: number }> = [];
  for (const [id, data] of gatheringStore.toolInventory) {
    if (data.tool.type === toolType.value) {
      tools.push({ id, ...data });
    }
  }
  return tools;
});

const gatheredBySkill = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; amount: number; sellPrice: number }> = [];
  for (const [id, amount] of gatheringStore.gatheredItems) {
    const resource = getGatheringResource(id);
    if (resource && resource.skill === activeSkill.value) {
      items.push({
        id,
        name: resource.name,
        icon: resource.icon,
        amount,
        sellPrice: resource.sellPrice,
      });
    }
  }
  return items;
});

// Actions
function selectSkill(skill: GatheringSkill) {
  activeSkill.value = skill;
}

function startGather(resourceId: string) {
  gatheringStore.startGathering(resourceId, gatheringStore.autoGatherEnabled);
}

function stopGather() {
  gatheringStore.stopGathering();
}

function equipTool(toolId: string) {
  gatheringStore.equipTool(toolId);
  showToolsDialog.value = false;
}

function sellResource(resourceId: string) {
  const amount = gatheringStore.getResourceCount(resourceId);
  if (amount > 0) {
    gatheringStore.sellResource(resourceId, amount);
  }
}

function sellAll() {
  gatheringStore.sellAllResources(activeSkill.value);
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'grey',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'orange',
    mythic: 'red',
  };
  return colors[rarity] || 'grey';
}

function getTierLabel(tier: number): string {
  const labels = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return labels[tier] || tier.toString();
}
</script>

<template>
  <div class="gathering-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            :color="currentSkillData.color"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              {{ currentSkillData.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">{{ currentSkillData.name }}</span>
              <v-chip
                size="small"
                :color="currentSkillData.color"
              >
                Poziom {{ currentSkillProgress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ currentSkillData.description }}
            </div>
            <v-progress-linear
              :model-value="gatheringStore.getXpProgress(activeSkill)"
              :color="currentSkillData.color"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ currentSkillProgress.xp }} / {{ currentSkillProgress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
          <div class="text-center ml-4">
            <div class="text-h4">
              {{ currentPower }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Siła
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Skill Tabs -->
    <v-tabs
      v-model="activeSkill"
      color="primary"
      class="mb-4"
    >
      <v-tab
        v-for="(skill, id) in GATHERING_SKILLS"
        :key="id"
        :value="id"
      >
        <v-icon
          start
          :color="skill.color"
        >
          {{ skill.icon }}
        </v-icon>
        {{ skill.name }}
        <v-chip
          size="x-small"
          class="ml-2"
        >
          {{ gatheringStore.skills[id as GatheringSkill].level }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-row>
      <!-- Left: Resources -->
      <v-col
        cols="12"
        md="7"
      >
        <!-- Active Gathering -->
        <v-card
          v-if="gatheringStore.isGathering && gatheringStore.currentResource"
          class="mb-4"
        >
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-avatar
                :color="getRarityColor(gatheringStore.currentResource.rarity)"
                size="48"
                class="mr-3"
              >
                <v-icon color="white">
                  {{ gatheringStore.currentResource.icon }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h6">
                  Zbieranie: {{ gatheringStore.currentResource.name }}
                </div>
                <v-progress-linear
                  :model-value="gatheringStore.gatheringProgress"
                  color="success"
                  height="20"
                  rounded
                >
                  <template #default>
                    {{ Math.floor(gatheringStore.gatheringProgress) }}%
                  </template>
                </v-progress-linear>
              </div>
              <v-btn
                color="error"
                variant="tonal"
                class="ml-3"
                @click="stopGather"
              >
                Stop
              </v-btn>
            </div>
            <v-switch
              v-model="gatheringStore.autoGatherEnabled"
              label="Auto-zbieranie"
              color="success"
              hide-details
              density="compact"
            />
          </v-card-text>
        </v-card>

        <!-- Resources List -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              :color="currentSkillData.color"
              class="mr-2"
            >
              mdi-cube-outline
            </v-icon>
            Dostępne Zasoby
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="resource in availableResources"
                :key="resource.id"
                cols="6"
                md="4"
              >
                <v-card
                  variant="outlined"
                  :class="{ 'border-success': gatheringStore.activeGathering?.resourceId === resource.id }"
                  class="resource-card"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center mb-2">
                      <v-avatar
                        :color="getRarityColor(resource.rarity)"
                        size="36"
                        class="mr-2"
                      >
                        <v-icon
                          color="white"
                          size="20"
                        >
                          {{ resource.icon }}
                        </v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-body-2 font-weight-medium">
                          {{ resource.name }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Tier {{ getTierLabel(resource.tier) }}
                        </div>
                      </div>
                    </div>

                    <div class="d-flex justify-space-between text-caption mb-2">
                      <span>
                        <v-icon size="12">mdi-star</v-icon>
                        Lvl {{ resource.requiredLevel }}
                      </span>
                      <span>
                        <v-icon size="12">mdi-arm-flex</v-icon>
                        {{ resource.requiredPower }}
                      </span>
                    </div>

                    <div class="d-flex justify-space-between text-caption mb-2">
                      <span>
                        <v-icon size="12">mdi-clock</v-icon>
                        {{ (resource.baseGatherTime / 10).toFixed(1) }}s
                      </span>
                      <span>
                        <v-icon size="12">mdi-currency-usd</v-icon>
                        {{ resource.sellPrice }}g
                      </span>
                    </div>

                    <v-btn
                      size="small"
                      :color="currentSkillData.color"
                      variant="tonal"
                      block
                      :disabled="gatheringStore.isGathering || currentPower < resource.requiredPower"
                      @click="startGather(resource.id)"
                    >
                      <v-icon start>
                        mdi-hammer
                      </v-icon>
                      Zbieraj
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              v-if="availableResources.length === 0"
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Brak dostępnych zasobów. Zwiększ poziom lub siłę wydobycia.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: Tools & Inventory -->
      <v-col
        cols="12"
        md="5"
      >
        <!-- Equipped Tool -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon
              color="amber"
              class="mr-2"
            >
              mdi-hammer-wrench
            </v-icon>
            Narzędzie
            <v-spacer />
            <v-btn
              size="small"
              variant="text"
              @click="showToolsDialog = true"
            >
              Zmień
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div
              v-if="equippedTool"
              class="d-flex align-center"
            >
              <v-avatar
                :color="getRarityColor(equippedTool.rarity)"
                size="48"
                class="mr-3"
              >
                <v-icon color="white">
                  {{ equippedTool.icon }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-medium">
                  {{ equippedTool.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Siła: +{{ equippedTool.gatheringPower }} •
                  Szybkość: +{{ equippedTool.gatheringSpeed }}%
                </div>
                <div class="text-caption">
                  Atak: {{ equippedTool.combatStats.attack || 0 }} •
                  Celność: {{ equippedTool.combatStats.accuracy || 0 }}
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-center text-medium-emphasis py-4"
            >
              <v-icon
                size="48"
                color="grey"
              >
                mdi-hammer-wrench
              </v-icon>
              <div class="mt-2">
                Brak narzędzia
              </div>
              <v-btn
                size="small"
                variant="tonal"
                class="mt-2"
                @click="showToolsDialog = true"
              >
                Wybierz narzędzie
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Gathered Items -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              color="teal"
              class="mr-2"
            >
              mdi-treasure-chest
            </v-icon>
            Zebrane Zasoby
            <v-spacer />
            <v-btn
              v-if="gatheredBySkill.length > 0"
              size="small"
              color="success"
              variant="tonal"
              @click="sellAll"
            >
              Sprzedaj wszystko
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list
              v-if="gatheredBySkill.length > 0"
              density="compact"
            >
              <v-list-item
                v-for="item in gatheredBySkill"
                :key="item.id"
              >
                <template #prepend>
                  <v-avatar size="32">
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.amount }}x • {{ item.sellPrice * item.amount }}g
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    size="x-small"
                    variant="text"
                    color="success"
                    @click="sellResource(item.id)"
                  >
                    Sprzedaj
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <div
              v-else
              class="text-center text-medium-emphasis py-4"
            >
              Brak zebranych zasobów
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tools Dialog -->
    <v-dialog
      v-model="showToolsDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Wybierz Narzędzie</v-card-title>
        <v-card-text>
          <v-list v-if="ownedTools.length > 0">
            <v-list-item
              v-for="item in ownedTools"
              :key="item.id"
              :class="{ 'bg-primary-lighten-5': gatheringStore.equippedTools[toolType] === item.id }"
              @click="equipTool(item.id)"
            >
              <template #prepend>
                <v-avatar :color="getRarityColor(item.tool.rarity)">
                  <v-icon color="white">
                    {{ item.tool.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.tool.name }}</v-list-item-title>
              <v-list-item-subtitle>
                Siła: +{{ item.tool.gatheringPower }} •
                Trwałość: {{ item.durability }}/{{ item.maxDurability }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip
                  v-if="gatheringStore.equippedTools[toolType] === item.id"
                  size="small"
                  color="primary"
                >
                  Założone
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-4 text-medium-emphasis"
          >
            Nie posiadasz żadnych narzędzi tego typu.
            <br>
            Stwórz je w zakładce Rzemiosło.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showToolsDialog = false"
          >
            Zamknij
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.resource-card {
  transition: all 0.2s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
  border-width: 2px !important;
}
</style>
