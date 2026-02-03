<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaArchitectStore } from '../model/architect.store';
import { BUILDINGS, BUILDING_MATERIALS, CATEGORY_DATA, RARITY_DATA, type BuildingCategory } from '../data/architect.data';

const architectStore = useAteriaArchitectStore();
const activeTab = ref<'build' | 'city' | 'materials'>('build');
const selectedCategory = ref<BuildingCategory | 'all'>('all');

const filteredBuildings = computed(() => {
  if (selectedCategory.value === 'all') return architectStore.availableBuildings;
  return architectStore.availableBuildings.filter(b => b.category === selectedCategory.value);
});

const materialsList = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; amount: number }> = [];
  for (const [id, amount] of architectStore.materials) {
    const mat = BUILDING_MATERIALS[id];
    if (mat && amount > 0) items.push({ id, name: mat.name, icon: mat.icon, amount });
  }
  return items;
});
</script>

<template>
  <div class="architect-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="brown" size="56" class="mr-4"><v-icon size="32" color="white">mdi-home-city</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Architekt</span>
              <v-chip size="small" color="brown">Poziom {{ architectStore.progress.level }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Budowle, miasto, rozwój</div>
            <v-progress-linear :model-value="architectStore.getXpProgress()" color="brown" height="8" rounded class="mt-2">
              <template #default><span class="text-caption">{{ architectStore.progress.xp }} / {{ architectStore.progress.xpToNextLevel }} XP</span></template>
            </v-progress-linear>
          </div>
        </div>
        <v-row class="mt-3">
          <v-col cols="3" class="text-center"><div class="text-h6">{{ architectStore.totalBuildingsBuilt }}</div><div class="text-caption">Zbudowane</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ architectStore.totalPopulation }}</div><div class="text-caption">Populacja</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ architectStore.totalDefense }}%</div><div class="text-caption">Obrona</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ architectStore.builtBuildings.size }}</div><div class="text-caption">Typów</div></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="architectStore.isConstructing && architectStore.activeConstruction" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar color="brown" size="48" class="mr-3"><v-icon color="white">{{ BUILDINGS[architectStore.activeConstruction.buildingId]?.icon }}</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Budowa: {{ BUILDINGS[architectStore.activeConstruction.buildingId]?.name }}</div>
            <v-progress-linear :model-value="architectStore.constructionProgress" color="brown" height="20" rounded><template #default>{{ Math.floor(architectStore.constructionProgress) }}%</template></v-progress-linear>
          </div>
          <v-btn color="error" variant="tonal" class="ml-3" @click="architectStore.cancelConstruction()">Anuluj</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="brown" class="mb-4">
      <v-tab value="build"><v-icon start>mdi-hammer</v-icon>Buduj</v-tab>
      <v-tab value="city"><v-icon start>mdi-city</v-icon>Miasto</v-tab>
      <v-tab value="materials"><v-icon start>mdi-cube</v-icon>Materiały</v-tab>
    </v-tabs>

    <div v-if="activeTab === 'build'">
      <v-chip-group v-model="selectedCategory" mandatory class="mb-4">
        <v-chip value="all" variant="outlined">Wszystkie</v-chip>
        <v-chip v-for="(data, cat) in CATEGORY_DATA" :key="cat" :value="cat" :color="data.color" variant="outlined"><v-icon start size="small">{{ data.icon }}</v-icon>{{ data.name }}</v-chip>
      </v-chip-group>

      <v-row>
        <v-col v-for="building in filteredBuildings" :key="building.id" cols="12" md="6" lg="4">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="CATEGORY_DATA[building.category].color" size="48"><v-icon color="white">{{ building.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ building.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ CATEGORY_DATA[building.category].name }} • {{ RARITY_DATA[building.rarity].label }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ building.description }}</div>
              <div class="mb-2">
                <v-chip v-for="mat in building.materials" :key="mat.materialId" size="x-small" :color="(architectStore.materials.get(mat.materialId) || 0) >= mat.amount ? 'success' : 'error'" class="mr-1 mb-1">{{ BUILDING_MATERIALS[mat.materialId]?.name }}: {{ mat.amount }}</v-chip>
                <v-chip size="x-small" color="amber" class="mr-1 mb-1">{{ building.goldCost }}g</v-chip>
              </div>
              <div class="mb-2">
                <v-chip v-for="(effect, idx) in building.effects" :key="idx" size="x-small" color="primary" variant="outlined" class="mr-1">{{ effect.description }}</v-chip>
              </div>
              <div class="text-caption mb-2">Zbudowane: {{ architectStore.builtBuildings.get(building.id) || 0 }}/{{ building.maxCount }}</div>
              <v-btn block color="brown" :disabled="!architectStore.canBuild(building.id).canBuild" @click="architectStore.startConstruction(building.id)"><v-icon start>mdi-hammer</v-icon>Buduj</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'city'">
      <v-card>
        <v-card-title>Twoje Miasto</v-card-title>
        <v-card-text>
          <v-list v-if="architectStore.builtBuildings.size > 0">
            <v-list-item v-for="[buildingId, count] in architectStore.builtBuildings" :key="buildingId">
              <template #prepend><v-avatar :color="CATEGORY_DATA[BUILDINGS[buildingId]?.category || 'residential'].color"><v-icon color="white">{{ BUILDINGS[buildingId]?.icon }}</v-icon></v-avatar></template>
              <v-list-item-title>{{ BUILDINGS[buildingId]?.name }} x{{ count }}</v-list-item-title>
              <v-list-item-subtitle><span v-for="(effect, idx) in BUILDINGS[buildingId]?.effects" :key="idx">{{ effect.description }} (x{{ count }}) </span></v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-8 text-medium-emphasis">Brak zbudowanych budowli</div>
        </v-card-text>
      </v-card>
    </div>

    <div v-if="activeTab === 'materials'">
      <v-card>
        <v-card-title>Materiały Budowlane</v-card-title>
        <v-card-text>
          <div v-if="materialsList.length > 0" class="d-flex flex-wrap gap-2">
            <v-chip v-for="mat in materialsList" :key="mat.id" size="large"><v-icon start>{{ mat.icon }}</v-icon>{{ mat.name }}: {{ mat.amount }}</v-chip>
          </div>
          <div v-else class="text-center py-4 text-medium-emphasis">Brak materiałów</div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
