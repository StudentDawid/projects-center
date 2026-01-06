<script setup lang="ts">
import { computed } from 'vue';
import { useRelicStore, RARITY_COLORS, RARITY_NAMES } from '~/stores/relics';
import type { Relic, RelicRarity } from '~/shared/types/game.types';

const relicStore = useRelicStore();

// Group relics by rarity
const relicsByRarity = computed(() => {
  const groups: Record<RelicRarity, Relic[]> = {
    legendary: [],
    epic: [],
    rare: [],
    common: [],
  };

  for (const relic of relicStore.ownedRelics) {
    groups[relic.rarity].push(relic);
  }

  return groups;
});

// Get count of owned relics per rarity
const rarityStats = computed(() => {
  const total = relicStore.relics.length;
  const owned = relicStore.ownedRelics.length;
  return {
    total,
    owned,
    percentage: Math.round((owned / total) * 100),
  };
});

// Active bonuses display
const activeBonuses = computed(() => {
  const bonuses = relicStore.totalBonuses;
  const list: { icon: string; name: string; value: string; color: string }[] = [];

  // Production multipliers
  for (const [resourceId, value] of Object.entries(bonuses.productionMultipliers)) {
    if (value && value > 0) {
      const resourceNames: Record<string, string> = {
        faith: 'Wiary',
        ducats: 'Dukatów',
        biomass: 'Biomasy',
        souls: 'Dusz',
        rage: 'Gniewu',
      };
      list.push({
        icon: '📈',
        name: `Produkcja ${resourceNames[resourceId] || resourceId}`,
        value: `+${value}%`,
        color: '#4caf50',
      });
    }
  }

  if (bonuses.allProductionMultiplier > 0) {
    list.push({
      icon: '⚡',
      name: 'Wszystkie produkcje',
      value: `+${bonuses.allProductionMultiplier}%`,
      color: '#ff9800',
    });
  }

  if (bonuses.clickMultiplier > 0) {
    list.push({
      icon: '👆',
      name: 'Kliknięcia',
      value: `+${bonuses.clickMultiplier}%`,
      color: '#2196f3',
    });
  }

  if (bonuses.doubleClickChance > 0) {
    list.push({
      icon: '✨',
      name: 'Szansa na x2 klik',
      value: `${bonuses.doubleClickChance}%`,
      color: '#e91e63',
    });
  }

  if (bonuses.defenseBonus > 0) {
    list.push({
      icon: '🛡️',
      name: 'Obrona',
      value: `+${bonuses.defenseBonus}%`,
      color: '#795548',
    });
  }

  if (bonuses.moraleRegenBonus > 0) {
    list.push({
      icon: '❤️',
      name: 'Regeneracja morale',
      value: `+${bonuses.moraleRegenBonus}%`,
      color: '#f44336',
    });
  }

  if (bonuses.moraleDamageReduction > 0) {
    list.push({
      icon: '🔰',
      name: 'Redukcja obrażeń morale',
      value: `-${bonuses.moraleDamageReduction}%`,
      color: '#009688',
    });
  }

  if (bonuses.moraleMinimum > 0) {
    list.push({
      icon: '💪',
      name: 'Minimum morale',
      value: `${bonuses.moraleMinimum}`,
      color: '#673ab7',
    });
  }

  if (bonuses.waveDelayBonus > 0) {
    list.push({
      icon: '⏱️',
      name: 'Czas między falami',
      value: `+${bonuses.waveDelayBonus}s`,
      color: '#607d8b',
    });
  }

  if (bonuses.prestigeBonus > 0) {
    list.push({
      icon: '🔥',
      name: 'Popioły Męczenników',
      value: `+${bonuses.prestigeBonus}%`,
      color: '#ff5722',
    });
  }

  return list;
});

function getRarityColor(rarity: RelicRarity): string {
  return RARITY_COLORS[rarity];
}

function getRarityName(rarity: RelicRarity): string {
  return RARITY_NAMES[rarity];
}

function handleEquip(relicId: string) {
  if (relicStore.availableSlots > 0) {
    relicStore.equipRelic(relicId);
  }
}

function handleUnequip(relicId: string) {
  relicStore.unequipRelic(relicId);
}
</script>

<template>
  <div class="relic-panel">
    <!-- Header with stats -->
    <div class="panel-header">
      <div class="header-icon">🏺</div>
      <div class="header-info">
        <h2 class="header-title">Relikwie</h2>
        <p class="header-subtitle">
          {{ rarityStats.owned }}/{{ rarityStats.total }} odkrytych ({{ rarityStats.percentage }}%)
        </p>
      </div>
    </div>

    <!-- Equipped slots -->
    <div class="equipped-section">
      <h3 class="section-title">
        <v-icon size="small">mdi-treasure-chest</v-icon>
        Wyposażone ({{ relicStore.equippedRelics.length }}/{{ relicStore.unlockedSlots.length }})
      </h3>
      <div class="slots-grid">
        <div
          v-for="slot in relicStore.unlockedSlots"
          :key="slot.index"
          class="relic-slot"
          :class="{ empty: !slot.relicId }"
        >
          <template v-if="slot.relicId">
            <div
              class="slot-relic"
              :style="{ borderColor: getRarityColor(relicStore.getRelicById(slot.relicId)!.rarity) }"
            >
              <span class="relic-icon">{{ relicStore.getRelicById(slot.relicId)?.icon }}</span>
              <v-tooltip activator="parent" location="top">
                <div class="relic-tooltip">
                  <div class="tooltip-header" :style="{ color: getRarityColor(relicStore.getRelicById(slot.relicId)!.rarity) }">
                    {{ relicStore.getRelicById(slot.relicId)?.name }}
                  </div>
                  <div class="tooltip-rarity">{{ getRarityName(relicStore.getRelicById(slot.relicId)!.rarity) }}</div>
                  <div class="tooltip-desc">{{ relicStore.getRelicById(slot.relicId)?.description }}</div>
                  <div class="tooltip-lore">{{ relicStore.getRelicById(slot.relicId)?.lore }}</div>
                </div>
              </v-tooltip>
              <v-btn
                icon
                size="x-small"
                class="unequip-btn"
                @click.stop="handleUnequip(slot.relicId)"
              >
                <v-icon size="12">mdi-close</v-icon>
              </v-btn>
            </div>
          </template>
          <template v-else>
            <div class="empty-slot">
              <v-icon size="24" color="grey">mdi-help</v-icon>
            </div>
          </template>
        </div>

        <!-- Locked slots -->
        <div
          v-for="slot in relicStore.slots.filter(s => !s.unlocked)"
          :key="`locked-${slot.index}`"
          class="relic-slot locked"
        >
          <v-icon size="24" color="grey">mdi-lock</v-icon>
          <v-tooltip activator="parent" location="top">
            Odblokuj przez ulepszenie prestiżu
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Active bonuses -->
    <div v-if="activeBonuses.length > 0" class="bonuses-section">
      <h3 class="section-title">
        <v-icon size="small">mdi-star-four-points</v-icon>
        Aktywne bonusy
      </h3>
      <div class="bonuses-grid">
        <div
          v-for="bonus in activeBonuses"
          :key="bonus.name"
          class="bonus-item"
          :style="{ borderColor: bonus.color }"
        >
          <span class="bonus-icon">{{ bonus.icon }}</span>
          <span class="bonus-name">{{ bonus.name }}</span>
          <span class="bonus-value" :style="{ color: bonus.color }">{{ bonus.value }}</span>
        </div>
      </div>
    </div>

    <!-- Relic collection by rarity -->
    <div class="collection-section">
      <h3 class="section-title">
        <v-icon size="small">mdi-view-grid</v-icon>
        Kolekcja
      </h3>

      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          v-for="rarity in (['legendary', 'epic', 'rare', 'common'] as RelicRarity[])"
          :key="rarity"
        >
          <v-expansion-panel-title :style="{ borderLeft: `4px solid ${getRarityColor(rarity)}` }">
            <div class="rarity-header">
              <span class="rarity-name" :style="{ color: getRarityColor(rarity) }">
                {{ getRarityName(rarity) }}
              </span>
              <span class="rarity-count">
                {{ relicsByRarity[rarity].length }}/{{ relicStore.relics.filter(r => r.rarity === rarity).length }}
              </span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="relics-grid">
              <div
                v-for="relic in relicStore.relics.filter(r => r.rarity === rarity)"
                :key="relic.id"
                class="relic-card"
                :class="{ owned: relic.owned, equipped: relic.equipped }"
                :style="{ borderColor: relic.owned ? getRarityColor(rarity) : '#333' }"
              >
                <div class="relic-card-header">
                  <span class="relic-card-icon">{{ relic.owned ? relic.icon : '❓' }}</span>
                  <span v-if="relic.equipped" class="equipped-badge">Wyposażona</span>
                </div>
                <div class="relic-card-name">
                  {{ relic.owned ? relic.name : '???' }}
                </div>
                <div v-if="relic.owned" class="relic-card-desc">
                  {{ relic.description }}
                </div>
                <div v-if="relic.owned && !relic.equipped && relicStore.availableSlots > 0" class="relic-card-actions">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="outlined"
                    @click="handleEquip(relic.id)"
                  >
                    Wyposaż
                  </v-btn>
                </div>
                <div v-else-if="!relic.owned" class="relic-card-locked">
                  <v-icon size="16" color="grey">mdi-lock</v-icon>
                  <span>{{ getSourceText(relic.source) }}</span>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script lang="ts">
function getSourceText(source: string): string {
  const sources: Record<string, string> = {
    wave: 'Drop z fal',
    boss: 'Drop z bossa',
    prestige: 'Nagroda prestiżu',
    achievement: 'Osiągnięcie',
    event: 'Wydarzenie',
  };
  return sources[source] || 'Nieznane';
}
</script>

<style scoped lang="scss">
.relic-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  min-height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.header-icon {
  font-size: 48px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffc107;
  margin: 0;
  font-family: 'Cinzel', serif;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.equipped-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slots-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.relic-slot {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.2);

  &.locked {
    opacity: 0.5;
  }

  &.empty {
    border-style: dashed;
  }
}

.slot-relic {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.relic-icon {
  font-size: 32px;
}

.unequip-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336 !important;
}

.relic-tooltip {
  max-width: 250px;
}

.tooltip-header {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.tooltip-rarity {
  font-size: 11px;
  opacity: 0.7;
  margin-bottom: 8px;
}

.tooltip-desc {
  font-size: 12px;
  margin-bottom: 8px;
}

.tooltip-lore {
  font-size: 11px;
  font-style: italic;
  opacity: 0.6;
}

.bonuses-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bonuses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid;
}

.bonus-icon {
  font-size: 18px;
}

.bonus-name {
  flex: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.bonus-value {
  font-size: 14px;
  font-weight: 700;
}

.collection-section {
  flex: 1;
}

.rarity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 12px;
}

.rarity-name {
  font-weight: 600;
}

.rarity-count {
  font-size: 12px;
  opacity: 0.7;
}

.relics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 8px;
}

.relic-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.2s;

  &.owned {
    background: rgba(255, 255, 255, 0.05);
  }

  &.equipped {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
  }

  &:not(.owned) {
    opacity: 0.5;
  }
}

.relic-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.relic-card-icon {
  font-size: 28px;
}

.equipped-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #ffc107;
  color: #000;
  border-radius: 4px;
  font-weight: 600;
}

.relic-card-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.relic-card-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.relic-card-actions {
  display: flex;
  justify-content: flex-end;
}

.relic-card-locked {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
</style>

