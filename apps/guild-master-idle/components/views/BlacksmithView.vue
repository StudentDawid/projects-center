<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('blacksmith.title') }}</h2>
    <p class="view-subtitle">{{ t('blacksmith.subtitle') }}</p>

    <!-- Materials display -->
    <div class="section-block">
      <h3 class="section-label">{{ t('blacksmith.materials') }}</h3>
      <div class="bs-materials-row">
        <div class="bs-material-chip">
          <span class="bs-material-icon">⚙️</span>
          <span class="bs-material-label">{{ t('equipment.metalScraps') }}</span>
          <span class="bs-material-value">{{ game.metalScraps }}</span>
        </div>
        <div class="bs-material-chip">
          <span class="bs-material-icon">✨</span>
          <span class="bs-material-label">{{ t('equipment.magicDust') }}</span>
          <span class="bs-material-value">{{ game.magicDust }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs: Upgrade / Salvage -->
    <div class="bs-tabs">
      <button class="bs-tab" :class="{ 'bs-tab-active': blacksmithTab === 'upgrade' }"
        @click="blacksmithTab = 'upgrade'; selectedUpgradeItem = null">
        🔨 {{ t('blacksmith.upgradeTab') }}
      </button>
      <button class="bs-tab" :class="{ 'bs-tab-active': blacksmithTab === 'salvage' }"
        @click="blacksmithTab = 'salvage'; selectedSalvageItem = null">
        ♻️ {{ t('blacksmith.salvageTab') }}
      </button>
    </div>

    <!-- Upgrade panel -->
    <div v-if="blacksmithTab === 'upgrade'" class="section-block">
      <p class="profile-description">{{ t('blacksmith.upgradeDesc') }}</p>
      <p class="bs-formula-hint">{{ t('blacksmith.costFormula') }}</p>

      <div v-if="allPlayerItems.length === 0" class="empty-state">
        <v-icon size="40" color="grey-lighten-1">mdi-sword-cross</v-icon>
        <p class="empty-text">{{ t('blacksmith.noItems') }}</p>
      </div>

      <div v-for="item in allPlayerItems" :key="item.uid" class="bs-item-card"
        :class="{ 'bs-item-selected': selectedUpgradeItem === item.uid }" @click="selectedUpgradeItem = item.uid">
        <div class="bs-item-header">
          <span class="bs-item-icon">{{ item.icon }}</span>
          <div class="bs-item-name-block">
            <span class="bs-item-name" :style="{ color: getItemColor(item) }">{{ getItemDisplayName(item) }}</span>
            <span class="bs-item-level">{{ t('equipment.level') }}{{ item.level }} / {{ item.maxLevel }}</span>
          </div>
          <span v-if="item.equippedBy" class="bs-equipped-badge">{{ t('equipment.equipped') }}</span>
        </div>

        <!-- Upgrade details (expanded when selected) -->
        <div v-if="selectedUpgradeItem === item.uid" class="bs-upgrade-details">
          <div class="bs-stat-list">
            <span v-for="(val, stat) in game.getItemStatBonuses(item)" :key="stat" class="bs-stat-bonus">
              +{{ val }} {{ String(stat).toUpperCase() }}
            </span>
          </div>
          <template v-if="item.level < item.maxLevel">
            <div class="bs-cost-row">
              <span class="bs-cost-label">{{ t('blacksmith.upgradeCost') }}:</span>
              <span class="cost-chip cost-gold">{{ game.getUpgradeCost(item).gold }}G</span>
              <span class="cost-chip cost-scraps">⚙️{{ game.getUpgradeCost(item).scraps }}</span>
              <span class="cost-chip cost-dust">✨{{ game.getUpgradeCost(item).dust }}</span>
            </div>
            <v-btn variant="flat" color="amber-darken-1" size="small"
              class="action-btn text-none font-weight-bold mt-2"
              :disabled="resources.gold < game.getUpgradeCost(item).gold || game.metalScraps < game.getUpgradeCost(item).scraps || game.magicDust < game.getUpgradeCost(item).dust"
              @click.stop="game.upgradeItem(item.uid)">
              {{ t('equipment.upgrade') }}
            </v-btn>
          </template>
          <v-chip v-else size="small" color="green" variant="tonal" class="mt-2">{{ t('equipment.maxLevel') }}</v-chip>
        </div>
      </div>
    </div>

    <!-- Salvage panel -->
    <div v-if="blacksmithTab === 'salvage'" class="section-block">
      <p class="profile-description">{{ t('blacksmith.salvageDesc') }}</p>

      <div v-if="game.inventory.length === 0" class="empty-state">
        <v-icon size="40" color="grey-lighten-1">mdi-sword-cross</v-icon>
        <p class="empty-text">{{ t('blacksmith.noItems') }}</p>
      </div>

      <div v-for="item in game.inventory" :key="item.uid" class="bs-item-card"
        :class="{ 'bs-item-selected': selectedSalvageItem === item.uid }" @click="selectedSalvageItem = item.uid">
        <div class="bs-item-header">
          <span class="bs-item-icon">{{ item.icon }}</span>
          <div class="bs-item-name-block">
            <span class="bs-item-name" :style="{ color: getItemColor(item) }">{{ getItemDisplayName(item) }}</span>
            <span class="bs-item-level">{{ t('equipment.level') }}{{ item.level }}</span>
          </div>
        </div>

        <div v-if="selectedSalvageItem === item.uid" class="bs-upgrade-details">
          <div class="bs-stat-list">
            <span v-for="(val, stat) in game.getItemStatBonuses(item)" :key="stat" class="bs-stat-bonus">
              +{{ val }} {{ String(stat).toUpperCase() }}
            </span>
          </div>
          <div class="bs-cost-row">
            <span class="bs-cost-label">{{ t('blacksmith.salvageYield') }}:</span>
            <span class="cost-chip cost-scraps">⚙️ ~{{ Math.round((SALVAGE_YIELDS[item.rarity][0] + SALVAGE_YIELDS[item.rarity][1]) / 2 + item.level * 0.5) }}</span>
            <span class="cost-chip cost-dust">✨ ~{{ Math.round((SALVAGE_YIELDS[item.rarity][2] + SALVAGE_YIELDS[item.rarity][3]) / 2 + item.level * 0.25) }}</span>
          </div>
          <v-btn variant="flat" color="red-darken-1" size="small"
            class="action-btn text-none font-weight-bold mt-2"
            @click.stop="game.salvageItem(item.uid); selectedSalvageItem = null">
            {{ t('equipment.salvage') }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore, RARITY_CONFIG, SALVAGE_YIELDS, type EquipmentItem, type EquipmentSlotType } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
const { resources } = storeToRefs(game);

const EQUIPMENT_SLOTS: EquipmentSlotType[] = ['rightHand', 'leftHand', 'armor', 'helmet', 'boots', 'accessory'];

const blacksmithTab = ref<'upgrade' | 'salvage'>('upgrade');
const selectedUpgradeItem = ref<string | null>(null);
const selectedSalvageItem = ref<string | null>(null);

function getItemDisplayName(item: EquipmentItem): string {
  const rarityName = t(RARITY_CONFIG[item.rarity].nameKey);
  const baseName = t(item.nameKey);
  if (item.affixes.length === 0) return `${rarityName} ${baseName}`;
  const affixNames = item.affixes.map((a) => t(a.nameKey)).join(' ');
  return `${rarityName} ${baseName} ${affixNames}`;
}

function getItemColor(item: EquipmentItem): string {
  return RARITY_CONFIG[item.rarity].color;
}

/** All items available to display in the blacksmith (inventory + equipped) */
interface DisplayItem extends EquipmentItem { equippedBy: string }
const allPlayerItems = computed((): DisplayItem[] => {
  const items: DisplayItem[] = [];
  for (const item of game.inventory) {
    items.push({ ...item, equippedBy: '' });
  }
  for (const hero of game.guildHeroes) {
    for (const slot of EQUIPMENT_SLOTS) {
      const item = hero.equipment[slot];
      if (item) items.push({ ...item, equippedBy: hero.name });
    }
  }
  return items;
});
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner { max-width: 768px; margin: 0 auto; }
.production-title {
  font-size: 24px; font-weight: 300; color: var(--text-heading);
  margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);
}
.view-subtitle { font-size: 14px; color: var(--text-muted); margin: -24px 0 32px; }
.section-block { margin-bottom: 40px; }
.section-label {
  font-size: 12px; font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;
}
.profile-description { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 32px 0; gap: 8px; }
.empty-text { font-size: 13px; color: var(--text-faint); text-align: center; }
.action-btn { min-width: 100px; }
.cost-chip { font-size: 0.7rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; line-height: 1.4; }
.cost-gold { background: rgba(251, 191, 36, 0.15); color: #b45309; }
.cost-scraps { background: rgba(158, 158, 158, 0.15); color: var(--text-body); }
.cost-dust { background: rgba(171, 71, 188, 0.15); color: #ab47bc; }

.bs-materials-row { display: flex; gap: 12px; flex-wrap: wrap; }
.bs-material-chip {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 6px; background: var(--bg-hover); border: 1px solid var(--border-light);
}
.bs-material-icon { font-size: 16px; }
.bs-material-label { font-size: 11px; color: var(--text-muted); }
.bs-material-value { font-size: 13px; font-weight: 700; font-family: monospace; color: var(--text-heading); }

.bs-tabs {
  display: flex; gap: 0; margin-bottom: 12px; border-radius: 6px;
  overflow: hidden; border: 1px solid var(--border-light);
}
.bs-tab {
  flex: 1; padding: 8px 16px; font-size: 12px; font-weight: 600; text-align: center;
  background: var(--bg-card); color: var(--text-muted); border: none; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.bs-tab:hover { background: var(--bg-hover); }
.bs-tab-active { background: var(--bg-hover); color: var(--text-heading); box-shadow: inset 0 -2px 0 var(--text-heading); }

.bs-formula-hint { font-size: 10px; font-style: italic; color: var(--text-faint); margin-bottom: 8px; }

.bs-item-card {
  padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-light);
  background: var(--bg-card); margin-bottom: 6px; cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.bs-item-card:hover { border-color: var(--text-muted); }
.bs-item-selected { border-color: #42a5f5; background: rgba(66, 165, 245, 0.05); }

.bs-item-header { display: flex; align-items: center; gap: 8px; }
.bs-item-icon { font-size: 18px; }
.bs-item-name-block { flex: 1; display: flex; flex-direction: column; }
.bs-item-name { font-size: 12px; font-weight: 700; }
.bs-item-level { font-size: 10px; font-family: monospace; color: var(--text-muted); }
.bs-equipped-badge {
  font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
  background: rgba(66, 165, 245, 0.12); color: #42a5f5;
}

.bs-upgrade-details { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); }
.bs-stat-list { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.bs-stat-bonus {
  font-size: 10px; font-weight: 700; font-family: monospace;
  padding: 1px 6px; border-radius: 3px; background: rgba(102, 187, 106, 0.12); color: #66bb6a;
}
.bs-cost-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.bs-cost-label { font-size: 10px; color: var(--text-muted); }
</style>
