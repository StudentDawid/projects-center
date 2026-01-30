<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaTamerStore } from '../model/tamer.store';
import { CREATURES, TAMING_ITEMS, CREATURE_FOOD, TYPE_DATA, RARITY_DATA, type CreatureType } from '../data/tamer.data';

const tamerStore = useAteriaTamerStore();
const activeTab = ref<'taming' | 'companions' | 'items'>('taming');
const selectedType = ref<CreatureType | 'all'>('all');

const filteredCreatures = computed(() => {
  const available = tamerStore.availableCreatures.filter(c => !tamerStore.tamedCreatures.has(c.id));
  if (selectedType.value === 'all') return available;
  return available.filter(c => c.type === selectedType.value);
});
</script>

<template>
  <div class="tamer-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="brown-darken-1" size="56" class="mr-4"><v-icon size="32" color="white">mdi-paw</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Zaklinacz</span>
              <v-chip size="small" color="brown-darken-1">Poziom {{ tamerStore.progress.level }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Oswajanie, towarzysze, trening</div>
            <v-progress-linear :model-value="tamerStore.getXpProgress()" color="brown-darken-1" height="8" rounded class="mt-2">
              <template #default><span class="text-caption">{{ tamerStore.progress.xp }} / {{ tamerStore.progress.xpToNextLevel }} XP</span></template>
            </v-progress-linear>
          </div>
        </div>
        <v-row class="mt-3">
          <v-col cols="3" class="text-center"><div class="text-h6">{{ tamerStore.tamingSkill + tamerStore.totalTamingBonus }}</div><div class="text-caption">Umiejętność</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ tamerStore.tamedCreatures.size }}/{{ tamerStore.maxCompanions }}</div><div class="text-caption">Stworzenia</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ tamerStore.totalCreaturesTamed }}</div><div class="text-caption">Oswojonych</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ tamerStore.currentCompanion?.nickname || '-' }}</div><div class="text-caption">Towarzysz</div></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="tamerStore.isTaming && tamerStore.activeTaming" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar color="brown-darken-1" size="48" class="mr-3"><v-icon color="white">{{ CREATURES[tamerStore.activeTaming.creatureId]?.icon }}</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Oswajanie: {{ CREATURES[tamerStore.activeTaming.creatureId]?.name }}</div>
            <v-progress-linear :model-value="tamerStore.tamingProgress" color="brown-darken-1" height="20" rounded><template #default>{{ Math.floor(tamerStore.tamingProgress) }}%</template></v-progress-linear>
          </div>
          <v-btn color="error" variant="tonal" class="ml-3" @click="tamerStore.cancelTaming()">Anuluj</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="brown-darken-1" class="mb-4">
      <v-tab value="taming"><v-icon start>mdi-heart</v-icon>Oswajanie</v-tab>
      <v-tab value="companions"><v-icon start>mdi-paw</v-icon>Towarzysze ({{ tamerStore.tamedCreatures.size }})</v-tab>
      <v-tab value="items"><v-icon start>mdi-bag-personal</v-icon>Przedmioty</v-tab>
    </v-tabs>

    <div v-if="activeTab === 'taming'">
      <v-chip-group v-model="selectedType" mandatory class="mb-4">
        <v-chip value="all" variant="outlined">Wszystkie</v-chip>
        <v-chip v-for="(data, type) in TYPE_DATA" :key="type" :value="type" :color="data.color" variant="outlined"><v-icon start size="small">{{ data.icon }}</v-icon>{{ data.name }}</v-chip>
      </v-chip-group>

      <v-row>
        <v-col v-for="creature in filteredCreatures" :key="creature.id" cols="12" md="6" lg="4">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="TYPE_DATA[creature.type].color" size="48"><v-icon color="white">{{ creature.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ creature.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ TYPE_DATA[creature.type].name }} • {{ RARITY_DATA[creature.rarity].label }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ creature.description }}</div>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip size="x-small" color="red">ATK {{ creature.baseStats.attack }}</v-chip>
                <v-chip size="x-small" color="blue">DEF {{ creature.baseStats.defense }}</v-chip>
                <v-chip size="x-small" color="green">HP {{ creature.baseStats.hp }}</v-chip>
                <v-chip size="x-small" color="orange">SPD {{ creature.baseStats.speed }}</v-chip>
              </div>
              <div class="text-caption mb-2">Trudność: {{ creature.tamingDifficulty }} • Szansa: {{ Math.min(95, Math.max(5, 100 - creature.tamingDifficulty + tamerStore.totalTamingBonus)) }}%</div>
              <v-btn block color="brown-darken-1" :disabled="!tamerStore.canTame(creature.id).canTame" @click="tamerStore.startTaming(creature.id)"><v-icon start>mdi-heart</v-icon>Oswój</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'companions'">
      <v-card v-if="tamerStore.tamedCreatures.size > 0">
        <v-list>
          <v-list-item v-for="[creatureId, tamed] in tamerStore.tamedCreatures" :key="creatureId">
            <template #prepend>
              <v-avatar :color="TYPE_DATA[CREATURES[creatureId]?.type || 'beast'].color"><v-icon color="white">{{ CREATURES[creatureId]?.icon }}</v-icon></v-avatar>
            </template>
            <v-list-item-title>
              {{ tamed.nickname }}
              <v-chip v-if="tamerStore.activeCompanion === creatureId" size="x-small" color="success" class="ml-2">Aktywny</v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              Lvl {{ tamed.level }} • ATK {{ tamed.stats.attack }} • DEF {{ tamed.stats.defense }} • HP {{ tamed.stats.hp }} • Szczęście: {{ Math.floor(tamed.happiness) }}%
            </v-list-item-subtitle>
            <template #append>
              <v-btn v-if="tamerStore.activeCompanion !== creatureId" size="small" color="primary" variant="tonal" class="mr-2" @click="tamerStore.setActiveCompanion(creatureId)">Aktywuj</v-btn>
              <v-btn size="small" color="success" variant="tonal" class="mr-2" @click="tamerStore.feedCreature(creatureId, 'magic_treats')">Nakarm</v-btn>
              <v-btn size="small" color="error" variant="tonal" @click="tamerStore.releaseCreature(creatureId)">Wypuść</v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
      <v-card v-else>
        <v-card-text class="text-center py-8 text-medium-emphasis">Brak oswojonych stworzeń</v-card-text>
      </v-card>
    </div>

    <div v-if="activeTab === 'items'">
      <v-row>
        <v-col v-for="item in Object.values(TAMING_ITEMS)" :key="item.id" cols="6" md="4" lg="3">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <v-icon size="36" color="brown-darken-1">{{ item.icon }}</v-icon>
              <div class="text-subtitle-2 mt-2">{{ item.name }}</div>
              <div class="text-caption">+{{ item.tamingBonus }}% oswajanie</div>
              <div class="text-caption mb-2">Posiadane: {{ tamerStore.ownedItems.get(item.id) || 0 }}</div>
              <v-btn size="small" color="amber" @click="tamerStore.buyItem(item.id)">Kup ({{ item.cost }}g)</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
