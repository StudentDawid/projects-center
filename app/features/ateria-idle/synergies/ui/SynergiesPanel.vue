<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaSynergiesStore } from '../model/synergies.store';
import {
  PATH_SYNERGIES, PATH_INFO, SYNERGY_TIER_DATA,
  getSynergiesFromPath, getSynergiesToPath, getAllPaths,
  type PathId, type PathSynergy
} from '../data/synergies.data';

const synergiesStore = useAteriaSynergiesStore();

const activeTab = ref<'overview' | 'matrix' | 'bonuses' | 'paths'>('overview');
const selectedPath = ref<PathId | null>(null);
const showInactive = ref(false);

const sortedPaths = computed(() => {
  return getAllPaths().sort((a, b) => {
    return synergiesStore.allPathLevels[b] - synergiesStore.allPathLevels[a];
  });
});

const selectedPathSynergies = computed(() => {
  if (!selectedPath.value) return { giving: [], receiving: [] };
  
  const giving = getSynergiesFromPath(selectedPath.value).map(synergy => {
    const active = synergiesStore.getSynergyDetails(synergy.fromPath, synergy.toPath);
    return { ...synergy, active, isUnlocked: !!active };
  });
  
  const receiving = getSynergiesToPath(selectedPath.value).map(synergy => {
    const active = synergiesStore.getSynergyDetails(synergy.fromPath, synergy.toPath);
    return { ...synergy, active, isUnlocked: !!active };
  });
  
  return { giving, receiving };
});

const topBonuses = computed(() => {
  const bonuses = synergiesStore.globalBonuses;
  const entries = Object.entries(bonuses)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  return entries;
});

function formatBonus(type: string, value: number): string {
  const isPercent = !['hp', 'population_bonus'].includes(type);
  return isPercent ? `+${value.toFixed(1)}%` : `+${Math.floor(value)}`;
}

function getBonusName(type: string): string {
  const names: Record<string, string> = {
    attack: 'Atak', defense: 'Obrona', hp: 'HP', hp_regen: 'Regeneracja HP',
    crit_chance: 'Szansa Kryt.', crit_damage: 'Obrażenia Kryt.',
    damage_reduction: 'Redukcja Obrażeń', accuracy: 'Celność', evasion: 'Unik',
    speed: 'Szybkość', gold_gain: 'Złoto', xp_gain: 'XP', drop_rate: 'Drop Rate',
    resource_gain: 'Zasoby', crafting_speed: 'Szybkość Craftingu',
    crafting_quality: 'Jakość Craftingu', research_speed: 'Szybkość Badań',
    gathering_speed: 'Szybkość Zbierania', gathering_yield: 'Plony Zbierania',
    fishing_speed: 'Szybkość Łowienia', fishing_luck: 'Szczęście Łowienia',
    cooking_speed: 'Szybkość Gotowania', cooking_quality: 'Jakość Gotowania',
    reputation_gain: 'Reputacja', haggling: 'Targowanie', spell_power: 'Moc Zaklęć',
    mana_regen: 'Regeneracja Many', exploration_speed: 'Szybkość Eksploracji',
    discovery_chance: 'Szansa Odkrycia', performance_quality: 'Jakość Występu',
    fame_gain: 'Sława', brewing_speed: 'Szybkość Warzenia',
    potion_potency: 'Moc Mikstur', building_speed: 'Szybkość Budowy',
    population_bonus: 'Populacja', mission_success: 'Sukces Misji',
    intel_gain: 'Intel', taming_chance: 'Szansa Oswojenia',
    companion_power: 'Moc Towarzysza', faith_gain: 'Wiara',
    blessing_duration: 'Czas Błogosławieństw', meditation_speed: 'Szybkość Medytacji',
    vision_clarity: 'Klarowność Wizji', totem_power: 'Moc Totemów',
    harvest_yield: 'Plony',
  };
  return names[type] || type;
}

function selectPath(pathId: PathId) {
  selectedPath.value = selectedPath.value === pathId ? null : pathId;
}
</script>

<template>
  <div class="synergies-panel">
    <!-- Header Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="purple" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-link-variant</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Synergie Ścieżek</span>
              <v-chip size="small" color="success">
                {{ synergiesStore.totalActiveSynergies }} / {{ PATH_SYNERGIES.length }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Zależności między wszystkimi ścieżkami</div>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ synergiesStore.totalLevels }}</div>
            <div class="text-caption">Suma Poziomów</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ synergiesStore.totalActiveSynergies }}</div>
            <div class="text-caption">Aktywne Synergie</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ synergiesStore.synergyStatistics.byTier.major + synergiesStore.synergyStatistics.byTier.legendary }}</div>
            <div class="text-caption">Silne Synergie</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ synergiesStore.specialEffectsTriggered }}</div>
            <div class="text-caption">Efekty Specjalne</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="purple" class="mb-4">
      <v-tab value="overview">
        <v-icon start>mdi-view-dashboard</v-icon>
        Przegląd
      </v-tab>
      <v-tab value="matrix">
        <v-icon start>mdi-table</v-icon>
        Macierz
      </v-tab>
      <v-tab value="bonuses">
        <v-icon start>mdi-chart-bar</v-icon>
        Bonusy
      </v-tab>
      <v-tab value="paths">
        <v-icon start>mdi-routes</v-icon>
        Ścieżki
      </v-tab>
    </v-tabs>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <!-- Tier breakdown -->
      <v-card class="mb-4">
        <v-card-title>Aktywne Synergie wg Tieru</v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="(data, tier) in SYNERGY_TIER_DATA" :key="tier" cols="3">
              <div class="text-center">
                <v-avatar :color="data.color" size="48">
                  <span class="text-h6 white--text">{{ synergiesStore.synergyStatistics.byTier[tier] }}</span>
                </v-avatar>
                <div class="text-caption mt-1">{{ data.name }}</div>
                <div class="text-caption text-medium-emphasis">x{{ data.multiplier }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Top bonuses -->
      <v-card class="mb-4">
        <v-card-title>Top 10 Bonusów z Synergii</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item v-for="([type, value], idx) in topBonuses" :key="type">
              <template #prepend>
                <v-avatar color="success" size="32">
                  <span class="text-caption">{{ idx + 1 }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ getBonusName(type) }}</v-list-item-title>
              <template #append>
                <v-chip color="success" size="small">{{ formatBonus(type, value) }}</v-chip>
              </template>
            </v-list-item>
            <v-list-item v-if="topBonuses.length === 0">
              <v-list-item-title class="text-medium-emphasis">Brak aktywnych bonusów. Rozwijaj ścieżki!</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Path levels quick view -->
      <v-card>
        <v-card-title>Poziomy Ścieżek</v-card-title>
        <v-card-text>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="pathId in sortedPaths"
              :key="pathId"
              :color="PATH_INFO[pathId].color"
              variant="elevated"
              @click="selectPath(pathId)"
            >
              <v-icon start>{{ PATH_INFO[pathId].icon }}</v-icon>
              {{ PATH_INFO[pathId].name }}: {{ synergiesStore.allPathLevels[pathId] }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Matrix Tab -->
    <div v-if="activeTab === 'matrix'">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>Macierz Synergii</span>
          <v-spacer />
          <v-switch v-model="showInactive" label="Pokaż nieaktywne" density="compact" hide-details class="ml-4" />
        </v-card-title>
        <v-card-text>
          <div class="matrix-container" style="overflow-x: auto;">
            <table class="synergy-matrix">
              <thead>
                <tr>
                  <th class="corner-cell">Od \ Do</th>
                  <th v-for="pathId in getAllPaths()" :key="pathId" class="header-cell">
                    <v-tooltip :text="PATH_INFO[pathId].name" location="top">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" :color="PATH_INFO[pathId].color" size="20">
                          {{ PATH_INFO[pathId].icon }}
                        </v-icon>
                      </template>
                    </v-tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="fromPath in getAllPaths()" :key="fromPath">
                  <td class="row-header">
                    <v-icon :color="PATH_INFO[fromPath].color" size="18" class="mr-1">
                      {{ PATH_INFO[fromPath].icon }}
                    </v-icon>
                    <span class="text-caption">{{ synergiesStore.allPathLevels[fromPath] }}</span>
                  </td>
                  <td v-for="toPath in getAllPaths()" :key="toPath" class="matrix-cell">
                    <template v-if="fromPath === toPath">
                      <span class="text-medium-emphasis">-</span>
                    </template>
                    <template v-else>
                      <template v-if="synergiesStore.isSynergyActive(fromPath, toPath)">
                        <v-tooltip location="top">
                          <template #activator="{ props }">
                            <v-icon v-bind="props" color="success" size="16">mdi-check-circle</v-icon>
                          </template>
                          <div class="pa-2">
                            <div class="font-weight-bold">{{ PATH_SYNERGIES.find(s => s.fromPath === fromPath && s.toPath === toPath)?.name }}</div>
                            <div v-for="bonus in synergiesStore.getSynergyDetails(fromPath, toPath)?.bonuses" :key="bonus.type" class="text-caption">
                              {{ getBonusName(bonus.type) }}: {{ formatBonus(bonus.type, bonus.value) }}
                            </div>
                          </div>
                        </v-tooltip>
                      </template>
                      <template v-else-if="PATH_SYNERGIES.find(s => s.fromPath === fromPath && s.toPath === toPath)">
                        <v-tooltip v-if="showInactive" location="top">
                          <template #activator="{ props }">
                            <v-icon v-bind="props" color="grey" size="16">mdi-lock</v-icon>
                          </template>
                          <div class="pa-2">
                            <div class="font-weight-bold">{{ PATH_SYNERGIES.find(s => s.fromPath === fromPath && s.toPath === toPath)?.name }}</div>
                            <div class="text-caption">Wymaga poziomu {{ PATH_SYNERGIES.find(s => s.fromPath === fromPath && s.toPath === toPath)?.unlockLevel }} w {{ PATH_INFO[fromPath].name }}</div>
                          </div>
                        </v-tooltip>
                        <span v-else class="text-medium-emphasis">○</span>
                      </template>
                      <span v-else class="text-medium-emphasis">·</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 text-caption text-medium-emphasis">
            <v-icon color="success" size="14">mdi-check-circle</v-icon> Aktywna |
            <span v-if="showInactive"><v-icon color="grey" size="14">mdi-lock</v-icon> Zablokowana |</span>
            ○ Możliwa | · Brak
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Bonuses Tab -->
    <div v-if="activeTab === 'bonuses'">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Bojowe</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-if="synergiesStore.globalBonuses.attack > 0">
                  <template #prepend><v-icon color="red">mdi-sword</v-icon></template>
                  <v-list-item-title>Atak</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.attack.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.defense > 0">
                  <template #prepend><v-icon color="blue">mdi-shield</v-icon></template>
                  <v-list-item-title>Obrona</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.defense.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.hp > 0">
                  <template #prepend><v-icon color="pink">mdi-heart</v-icon></template>
                  <v-list-item-title>HP</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ Math.floor(synergiesStore.globalBonuses.hp) }}</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.crit_chance > 0">
                  <template #prepend><v-icon color="orange">mdi-flash</v-icon></template>
                  <v-list-item-title>Szansa Kryt.</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.crit_chance.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.damage_reduction > 0">
                  <template #prepend><v-icon color="teal">mdi-shield-half-full</v-icon></template>
                  <v-list-item-title>Redukcja Obrażeń</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.damage_reduction.toFixed(1) }}%</v-chip></template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Ekonomiczne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-if="synergiesStore.globalBonuses.gold_gain > 0">
                  <template #prepend><v-icon color="amber">mdi-currency-usd</v-icon></template>
                  <v-list-item-title>Złoto</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.gold_gain.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.xp_gain > 0">
                  <template #prepend><v-icon color="purple">mdi-star</v-icon></template>
                  <v-list-item-title>XP</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.xp_gain.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.resource_gain > 0">
                  <template #prepend><v-icon color="brown">mdi-package-variant</v-icon></template>
                  <v-list-item-title>Zasoby</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.resource_gain.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.haggling > 0">
                  <template #prepend><v-icon color="green">mdi-handshake</v-icon></template>
                  <v-list-item-title>Targowanie</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.haggling.toFixed(1) }}%</v-chip></template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Produkcyjne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-if="synergiesStore.globalBonuses.crafting_speed > 0">
                  <template #prepend><v-icon color="grey">mdi-hammer</v-icon></template>
                  <v-list-item-title>Szybkość Craftingu</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.crafting_speed.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.crafting_quality > 0">
                  <template #prepend><v-icon color="grey">mdi-diamond</v-icon></template>
                  <v-list-item-title>Jakość Craftingu</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.crafting_quality.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.gathering_speed > 0">
                  <template #prepend><v-icon color="brown">mdi-pickaxe</v-icon></template>
                  <v-list-item-title>Szybkość Zbierania</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.gathering_speed.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.cooking_quality > 0">
                  <template #prepend><v-icon color="orange">mdi-chef-hat</v-icon></template>
                  <v-list-item-title>Jakość Gotowania</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.cooking_quality.toFixed(1) }}%</v-chip></template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Magiczne i Inne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-if="synergiesStore.globalBonuses.spell_power > 0">
                  <template #prepend><v-icon color="purple">mdi-wizard-hat</v-icon></template>
                  <v-list-item-title>Moc Zaklęć</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.spell_power.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.research_speed > 0">
                  <template #prepend><v-icon color="blue">mdi-flask</v-icon></template>
                  <v-list-item-title>Szybkość Badań</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.research_speed.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.taming_chance > 0">
                  <template #prepend><v-icon color="orange">mdi-paw</v-icon></template>
                  <v-list-item-title>Szansa Oswojenia</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.taming_chance.toFixed(1) }}%</v-chip></template>
                </v-list-item>
                <v-list-item v-if="synergiesStore.globalBonuses.faith_gain > 0">
                  <template #prepend><v-icon color="yellow">mdi-church</v-icon></template>
                  <v-list-item-title>Wiara</v-list-item-title>
                  <template #append><v-chip color="success" size="small">+{{ synergiesStore.globalBonuses.faith_gain.toFixed(1) }}%</v-chip></template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Paths Tab -->
    <div v-if="activeTab === 'paths'">
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Wybierz Ścieżkę</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="pathId in sortedPaths"
                  :key="pathId"
                  :active="selectedPath === pathId"
                  @click="selectPath(pathId)"
                >
                  <template #prepend>
                    <v-avatar :color="PATH_INFO[pathId].color" size="32">
                      <v-icon size="18" color="white">{{ PATH_INFO[pathId].icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ PATH_INFO[pathId].name }}</v-list-item-title>
                  <v-list-item-subtitle>Poziom {{ synergiesStore.allPathLevels[pathId] }}</v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex flex-column align-end">
                      <v-chip size="x-small" color="success" class="mb-1">
                        ↑{{ synergiesStore.synergyStatistics.byPath[pathId].giving }}
                      </v-chip>
                      <v-chip size="x-small" color="info">
                        ↓{{ synergiesStore.synergyStatistics.byPath[pathId].receiving }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <template v-if="selectedPath">
            <!-- Giving synergies -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon :color="PATH_INFO[selectedPath].color" class="mr-2">{{ PATH_INFO[selectedPath].icon }}</v-icon>
                {{ PATH_INFO[selectedPath].name }} daje bonusy dla:
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col v-for="synergy in selectedPathSynergies.giving" :key="synergy.id" cols="12" md="6">
                    <v-card :variant="synergy.isUnlocked ? 'elevated' : 'outlined'" :class="{ 'opacity-60': !synergy.isUnlocked }">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-avatar :color="PATH_INFO[synergy.toPath].color" size="32" class="mr-2">
                            <v-icon size="18" color="white">{{ PATH_INFO[synergy.toPath].icon }}</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-2">{{ synergy.name }}</div>
                            <v-chip size="x-small" :color="SYNERGY_TIER_DATA[synergy.tier].color">
                              {{ SYNERGY_TIER_DATA[synergy.tier].name }}
                            </v-chip>
                          </div>
                        </div>
                        <div class="text-caption mb-2">{{ synergy.description }}</div>
                        <div v-if="synergy.isUnlocked && synergy.active" class="d-flex flex-wrap gap-1">
                          <v-chip v-for="bonus in synergy.active.bonuses" :key="bonus.type" size="x-small" color="success">
                            {{ getBonusName(bonus.type) }}: {{ formatBonus(bonus.type, bonus.value) }}
                          </v-chip>
                        </div>
                        <div v-else class="text-caption text-warning">
                          <v-icon size="small">mdi-lock</v-icon>
                          Wymaga poziomu {{ synergy.unlockLevel }}
                        </div>
                        <div v-if="synergy.specialEffect" class="mt-2 text-caption text-purple">
                          <v-icon size="small" color="purple">mdi-star</v-icon>
                          {{ synergy.specialEffect.name }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col v-if="selectedPathSynergies.giving.length === 0" cols="12">
                    <div class="text-center text-medium-emphasis pa-4">
                      Ta ścieżka nie daje bezpośrednich bonusów innym ścieżkom
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Receiving synergies -->
            <v-card>
              <v-card-title>
                <v-icon :color="PATH_INFO[selectedPath].color" class="mr-2">{{ PATH_INFO[selectedPath].icon }}</v-icon>
                {{ PATH_INFO[selectedPath].name }} otrzymuje bonusy od:
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col v-for="synergy in selectedPathSynergies.receiving" :key="synergy.id" cols="12" md="6">
                    <v-card :variant="synergy.isUnlocked ? 'elevated' : 'outlined'" :class="{ 'opacity-60': !synergy.isUnlocked }">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-avatar :color="PATH_INFO[synergy.fromPath].color" size="32" class="mr-2">
                            <v-icon size="18" color="white">{{ PATH_INFO[synergy.fromPath].icon }}</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-2">{{ synergy.name }}</div>
                            <v-chip size="x-small" :color="SYNERGY_TIER_DATA[synergy.tier].color">
                              {{ SYNERGY_TIER_DATA[synergy.tier].name }}
                            </v-chip>
                          </div>
                        </div>
                        <div class="text-caption mb-2">{{ synergy.description }}</div>
                        <div v-if="synergy.isUnlocked && synergy.active" class="d-flex flex-wrap gap-1">
                          <v-chip v-for="bonus in synergy.active.bonuses" :key="bonus.type" size="x-small" color="success">
                            {{ getBonusName(bonus.type) }}: {{ formatBonus(bonus.type, bonus.value) }}
                          </v-chip>
                        </div>
                        <div v-else class="text-caption text-warning">
                          <v-icon size="small">mdi-lock</v-icon>
                          Wymaga poziomu {{ synergy.unlockLevel }} w {{ PATH_INFO[synergy.fromPath].name }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col v-if="selectedPathSynergies.receiving.length === 0" cols="12">
                    <div class="text-center text-medium-emphasis pa-4">
                      Ta ścieżka nie otrzymuje bezpośrednich bonusów od innych ścieżek
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <v-card v-else>
            <v-card-text class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-arrow-left</v-icon>
              <div>Wybierz ścieżkę z listy po lewej stronie</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.synergy-matrix {
  border-collapse: collapse;
  font-size: 12px;
}

.synergy-matrix th,
.synergy-matrix td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px;
  text-align: center;
  min-width: 28px;
}

.corner-cell {
  background: rgba(0, 0, 0, 0.2);
}

.header-cell {
  background: rgba(0, 0, 0, 0.1);
}

.row-header {
  background: rgba(0, 0, 0, 0.1);
  text-align: left !important;
  padding-left: 8px !important;
  white-space: nowrap;
}

.matrix-cell {
  cursor: pointer;
}

.matrix-cell:hover {
  background: rgba(255, 255, 255, 0.1);
}

.opacity-60 {
  opacity: 0.6;
}
</style>
