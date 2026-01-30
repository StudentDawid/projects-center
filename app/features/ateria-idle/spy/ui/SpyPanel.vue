<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaSpyStore } from '../model/spy.store';
import { SPY_MISSIONS, SPY_GEAR, INFORMANTS, DIFFICULTY_DATA, MISSION_TYPE_DATA, type MissionType } from '../data/spy.data';

const spyStore = useAteriaSpyStore();
const activeTab = ref<'missions' | 'gear' | 'informants'>('missions');
const selectedType = ref<MissionType | 'all'>('all');

const filteredMissions = computed(() => {
  if (selectedType.value === 'all') return spyStore.availableMissions;
  return spyStore.availableMissions.filter(m => m.type === selectedType.value);
});
</script>

<template>
  <div class="spy-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="grey-darken-3" size="56" class="mr-4"><v-icon size="32" color="white">mdi-eye-off</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Szpieg</span>
              <v-chip size="small" color="grey-darken-2">Poziom {{ spyStore.progress.level }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Szpiegostwo, infiltracja, wywiad</div>
            <v-progress-linear :model-value="spyStore.getXpProgress()" color="grey-darken-2" height="8" rounded class="mt-2">
              <template #default><span class="text-caption">{{ spyStore.progress.xp }} / {{ spyStore.progress.xpToNextLevel }} XP</span></template>
            </v-progress-linear>
          </div>
        </div>
        <v-row class="mt-3">
          <v-col cols="3" class="text-center"><div class="text-h6">{{ spyStore.effectiveStealth }}</div><div class="text-caption">Skradanie</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ spyStore.successfulMissions }}/{{ spyStore.totalMissionsCompleted }}</div><div class="text-caption">Misje</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ Math.floor(spyStore.intel) }}</div><div class="text-caption">Intel</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6 text-amber">{{ spyStore.totalGoldStolen }}g</div><div class="text-caption">Zdobyte</div></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="spyStore.isOnMission && spyStore.activeMission" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar color="grey-darken-3" size="48" class="mr-3"><v-icon color="white">{{ SPY_MISSIONS[spyStore.activeMission.missionId]?.icon }}</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Misja: {{ SPY_MISSIONS[spyStore.activeMission.missionId]?.name }}</div>
            <v-progress-linear :model-value="spyStore.missionProgress" color="grey-darken-2" height="20" rounded><template #default>{{ Math.floor(spyStore.missionProgress) }}%</template></v-progress-linear>
          </div>
          <v-btn color="error" variant="tonal" class="ml-3" @click="spyStore.cancelMission()">Anuluj</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="grey-darken-2" class="mb-4">
      <v-tab value="missions"><v-icon start>mdi-target</v-icon>Misje</v-tab>
      <v-tab value="gear"><v-icon start>mdi-knife</v-icon>Sprzęt</v-tab>
      <v-tab value="informants"><v-icon start>mdi-account-group</v-icon>Informatorzy</v-tab>
    </v-tabs>

    <div v-if="activeTab === 'missions'">
      <v-chip-group v-model="selectedType" mandatory class="mb-4">
        <v-chip value="all" variant="outlined">Wszystkie</v-chip>
        <v-chip v-for="(data, type) in MISSION_TYPE_DATA" :key="type" :value="type" :color="data.color" variant="outlined"><v-icon start size="small">{{ data.icon }}</v-icon>{{ data.name }}</v-chip>
      </v-chip-group>

      <v-row>
        <v-col v-for="mission in filteredMissions" :key="mission.id" cols="12" md="6" lg="4">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="MISSION_TYPE_DATA[mission.type].color" size="48"><v-icon color="white">{{ mission.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ mission.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ MISSION_TYPE_DATA[mission.type].name }} • {{ DIFFICULTY_DATA[mission.difficulty].label }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ mission.description }}</div>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip size="x-small" :color="spyStore.effectiveStealth >= mission.stealthRequired ? 'success' : 'error'">{{ mission.stealthRequired }} skrad.</v-chip>
                <v-chip size="x-small" color="amber">{{ mission.goldCost }}g</v-chip>
                <v-chip size="x-small" color="success">+{{ mission.goldReward }}g</v-chip>
                <v-chip size="x-small" color="info">{{ Math.min(95, mission.successChance + spyStore.totalSuccessBonus) }}% sukces</v-chip>
              </div>
              <v-btn block color="grey-darken-3" :disabled="!spyStore.canStartMission(mission.id).canStart" @click="spyStore.startMission(mission.id)"><v-icon start>mdi-play</v-icon>Rozpocznij</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'gear'">
      <v-row>
        <v-col v-for="gear in Object.values(SPY_GEAR)" :key="gear.id" cols="12" md="6" lg="4">
          <v-card :variant="spyStore.ownedGear.has(gear.id) ? 'elevated' : 'outlined'" :class="{ 'border-primary': spyStore.equippedGear.has(gear.id) }">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="36" :color="spyStore.ownedGear.has(gear.id) ? 'grey-darken-3' : 'grey'">{{ gear.icon }}</v-icon>
                <div class="ml-3">
                  <div class="font-weight-medium">{{ gear.name }}</div>
                  <div class="text-caption">Tier {{ gear.tier }} • Lvl {{ gear.requiredLevel }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ gear.description }}</div>
              <div class="text-caption mb-2">+{{ gear.stealthBonus }} skradanie • +{{ gear.successBonus }}% sukces</div>
              <v-btn v-if="!spyStore.ownedGear.has(gear.id)" size="small" color="amber" block :disabled="gear.requiredLevel > spyStore.progress.level" @click="spyStore.buyGear(gear.id)">Kup ({{ gear.cost }}g)</v-btn>
              <v-btn v-else-if="!spyStore.equippedGear.has(gear.id)" size="small" color="primary" block @click="spyStore.equipGear(gear.id)">Załóż</v-btn>
              <v-btn v-else size="small" color="grey" block @click="spyStore.unequipGear(gear.id)">Zdejmij</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'informants'">
      <v-row>
        <v-col v-for="informant in Object.values(INFORMANTS)" :key="informant.id" cols="12" md="6">
          <v-card :variant="spyStore.recruitedInformants.has(informant.id) ? 'elevated' : 'outlined'">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="spyStore.recruitedInformants.has(informant.id) ? 'success' : 'grey'" size="48"><v-icon color="white">{{ informant.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="font-weight-medium">{{ informant.name }}</div>
                  <div class="text-caption">Tier {{ informant.tier }} • Lvl {{ informant.requiredLevel }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ informant.description }}</div>
              <div class="text-caption mb-2">+{{ informant.intelGain }} intel/min • +{{ informant.missionBonus }}% sukces • {{ informant.weeklyCost }}g/tydzień</div>
              <v-btn v-if="!spyStore.recruitedInformants.has(informant.id)" color="primary" block :disabled="informant.requiredLevel > spyStore.progress.level" @click="spyStore.recruitInformant(informant.id)">Zwerbuj ({{ informant.recruitCost }}g)</v-btn>
              <v-chip v-else color="success" block>Zwerbowany</v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.border-primary { border-color: rgb(var(--v-theme-primary)) !important; border-width: 2px !important; }
</style>
