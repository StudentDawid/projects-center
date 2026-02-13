<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('tavern.title') }}</h2>
    <p class="view-subtitle">{{ t('tavern.subtitle') }}</p>

    <!-- Tavern Upgrades (always visible) -->
    <div class="section-block">
      <h3 class="section-label">{{ t('tavern.upgrades') }}</h3>
      <p class="profile-description">{{ t('tavern.upgradesDesc') }}</p>

      <div class="action-card tavern-upgrade-card">
        <div class="tavern-upgrade-info">
          <div class="d-flex align-center ga-3">
            <span class="tavern-upgrade-icon">🛏️</span>
            <div>
              <div class="action-title">{{ t('tavern.rentBed') }}</div>
              <div class="action-cost">{{ t('tavern.rentBedDesc') }}</div>
            </div>
          </div>
          <div class="tavern-bed-status mt-2">
            <template v-if="game.nextBedCost !== null">
              <span class="bed-count">
                {{ t('tavern.bedsCurrent', { count: game.tavernUpgrades.beds, max: game.tavernUpgrades.bedCosts.length }) }}
              </span>
            </template>
            <template v-else>
              <span class="bed-count bed-maxed">{{ t('tavern.bedsMaxed') }}</span>
            </template>
          </div>
        </div>
        <div class="tavern-upgrade-action">
          <v-btn
            v-if="game.nextBedCost !== null"
            variant="flat"
            color="amber-darken-1"
            size="small"
            class="action-btn text-none font-weight-bold"
            :disabled="resources.gold < (game.nextBedCost ?? 0)"
            @click="game.buyTavernBed()"
          >
            {{ t('tavern.rentBedBtn') }} ({{ game.nextBedCost }}G)
          </v-btn>
          <v-btn
            v-else
            variant="flat"
            color="grey-lighten-1"
            size="small"
            class="action-btn text-none font-weight-bold"
            disabled
          >
            {{ t('tavern.bedsMaxed') }}
          </v-btn>
        </div>
      </div>

      <!-- Additional tavern items -->
      <div
        v-for="item in game.tavernUpgrades.items"
        :key="item.id"
        class="action-card tavern-upgrade-card"
      >
        <div class="tavern-upgrade-info">
          <div class="d-flex align-center ga-3">
            <span class="tavern-upgrade-icon">{{ item.icon }}</span>
            <div>
              <div class="action-title">{{ t(item.nameKey) }}</div>
              <div class="action-cost">{{ t(item.descKey) }}</div>
            </div>
          </div>
          <div v-if="!item.purchased" class="tavern-item-cost mt-2">
            <span v-if="item.cost.gold" class="cost-chip cost-gold">{{ item.cost.gold }}G</span>
            <span v-if="item.cost.wood" class="cost-chip cost-wood">{{ item.cost.wood }}W</span>
            <span v-if="item.cost.stone" class="cost-chip cost-stone">{{ item.cost.stone }}S</span>
          </div>
        </div>
        <div class="tavern-upgrade-action">
          <v-btn
            v-if="!item.purchased"
            variant="flat"
            color="amber-darken-1"
            size="small"
            class="action-btn text-none font-weight-bold"
            :disabled="resources.gold < item.cost.gold || resources.wood < item.cost.wood || resources.stone < item.cost.stone"
            @click="game.buyTavernItem(item.id)"
          >
            {{ t('tavern.buyItem') }}
          </v-btn>
          <v-chip v-else size="small" color="green" variant="tonal">
            <v-icon size="14" start>mdi-check</v-icon>
            {{ t('tavern.itemPurchased') }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Hint: no beds yet -->
    <div v-if="maxHeroes <= 0" class="tavern-hint-card">
      <v-icon size="20" color="amber-darken-2" class="mr-2">mdi-information</v-icon>
      <span>{{ t('tavern.noBedsYet') }}</span>
    </div>

    <!-- Available Adventurers (only after first bed) -->
    <div v-if="maxHeroes > 0" class="section-block">
      <h3 class="section-label">{{ t('tavern.available') }}</h3>

      <div v-if="tavernHeroes.length === 0" class="empty-state">
        <v-icon size="40" color="grey-lighten-1">mdi-account-search</v-icon>
        <p class="empty-text">No adventurers available right now. Check back later!</p>
      </div>

      <div v-for="hero in tavernHeroes" :key="hero.id" class="action-card hero-card">
        <div class="hero-info">
          <div class="hero-identity">
            <span class="hero-emoji">{{ hero.emoji }}</span>
            <div>
              <div class="action-title">{{ hero.name }}</div>
              <div class="hero-class" :class="`text-${hero.color}`">{{ t(hero.classKey) }}</div>
            </div>
          </div>
          <div class="hero-stats">
            <span class="stat-chip stat-atk">{{ t('tavern.atk') }} {{ hero.stats.atk }}</span>
            <span class="stat-chip stat-def">{{ t('tavern.def') }} {{ hero.stats.def }}</span>
            <span class="stat-chip stat-matk">{{ t('tavern.mAtk') }} {{ hero.stats.mAtk }}</span>
            <span class="stat-chip stat-mdef">{{ t('tavern.mDef') }} {{ hero.stats.mDef }}</span>
            <span class="stat-chip stat-hp">{{ t('tavern.hp') }} {{ hero.stats.hp }}</span>
            <span class="stat-chip stat-spd">{{ t('tavern.spd') }} {{ hero.stats.spd }}</span>
          </div>
          <div class="hero-meta">
            <span class="position-badge" :class="`pos-${hero.stats.spt}`">{{ t(`position.${hero.stats.spt}`) }}</span>
            <span class="state-badge" :class="`state-${hero.stats.state}`">{{ t(`state.${hero.stats.state}`) }}</span>
            <span v-for="tr in hero.traits" :key="tr.id" class="trait-badge" :title="t(tr.descKey)">
              {{ tr.icon }} {{ t(tr.nameKey) }}
            </span>
          </div>
        </div>
        <div class="hero-recruit">
          <div class="action-cost">{{ t('tavern.cost') }}: {{ hero.cost }} {{ t('resources.gold') }}</div>
          <v-btn
            variant="flat"
            color="blue-darken-1"
            size="small"
            class="action-btn text-none font-weight-bold"
            :disabled="resources.gold < hero.cost || guildHeroes.length >= maxHeroes"
            @click="game.recruitHero(hero.id)"
          >
            {{ t('tavern.recruit') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Guild Roster (only after first bed) -->
    <div v-if="maxHeroes > 0" class="section-block">
      <h3 class="section-label">
        {{ t('tavern.guildRoster') }}
        <span class="roster-count">({{ t('tavern.heroSlots', { current: guildHeroes.length, max: maxHeroes }) }})</span>
      </h3>

      <div v-if="guildHeroes.length === 0" class="empty-state">
        <v-icon size="40" color="grey-lighten-1">mdi-account-group</v-icon>
        <p class="empty-text">{{ t('tavern.rosterEmpty') }}</p>
      </div>

      <div v-for="hero in guildHeroes" :key="hero.id" class="action-card hero-card">
        <div class="hero-info">
          <div class="hero-identity">
            <span class="hero-emoji">{{ hero.emoji }}</span>
            <div>
              <div class="action-title">{{ hero.name }}</div>
              <div class="hero-class" :class="`text-${hero.color}`">{{ t(hero.classKey) }}</div>
            </div>
          </div>
          <div class="hero-stats">
            <span class="stat-chip stat-atk">{{ t('tavern.atk') }} {{ hero.stats.atk }}</span>
            <span class="stat-chip stat-def">{{ t('tavern.def') }} {{ hero.stats.def }}</span>
            <span class="stat-chip stat-matk">{{ t('tavern.mAtk') }} {{ hero.stats.mAtk }}</span>
            <span class="stat-chip stat-mdef">{{ t('tavern.mDef') }} {{ hero.stats.mDef }}</span>
            <span class="stat-chip stat-hp">{{ t('tavern.hp') }} {{ hero.stats.hp }}</span>
            <span class="stat-chip stat-spd">{{ t('tavern.spd') }} {{ hero.stats.spd }}</span>
          </div>
          <div class="hero-hp-bar">
            <div class="hp-bar-track">
              <div class="hp-bar-fill" :style="{ width: `${Math.round((hero.stats.currentHp / hero.stats.hp) * 100)}%` }"></div>
            </div>
            <span class="hp-bar-text">{{ hero.stats.currentHp }} / {{ hero.stats.hp }}</span>
          </div>
          <div class="hero-meta">
            <span class="position-badge" :class="`pos-${hero.stats.spt}`">{{ t(`position.${hero.stats.spt}`) }}</span>
            <span class="state-badge" :class="`state-${hero.stats.state}`">{{ t(`state.${hero.stats.state}`) }}</span>
            <span v-for="tr in hero.traits" :key="tr.id" class="trait-badge" :title="t(tr.descKey)">
              {{ tr.icon }} {{ t(tr.nameKey) }}
            </span>
          </div>

          <!-- Equipment grid -->
          <div class="hero-equipment-grid">
            <div
              v-for="slot in EQUIPMENT_SLOTS"
              :key="slot"
              class="eq-slot"
              :class="{ 'eq-slot-filled': hero.equipment[slot], 'eq-slot-active': equipHeroId === hero.id && equipSlot === slot }"
              @click="equipHeroId = hero.id; equipSlot = (equipSlot === slot && equipHeroId === hero.id) ? null : slot"
            >
              <span class="eq-slot-icon">{{ hero.equipment[slot]?.icon ?? SLOT_ICONS[slot] }}</span>
              <span v-if="hero.equipment[slot]" class="eq-slot-name" :style="{ color: getItemColor(hero.equipment[slot]!) }">
                {{ t(hero.equipment[slot]!.nameKey) }}
              </span>
              <span v-else class="eq-slot-name eq-slot-empty">{{ t(SLOT_LABELS[slot]) }}</span>
              <span v-if="hero.equipment[slot]" class="eq-slot-level">{{ t('equipment.level') }}{{ hero.equipment[slot]!.level }}</span>
            </div>
          </div>

          <!-- Equip action panel: show when a slot is selected on this hero -->
          <div v-if="equipHeroId === hero.id && equipSlot" class="eq-action-panel">
            <!-- Unequip current if occupied -->
            <v-btn
              v-if="hero.equipment[equipSlot]"
              variant="outlined"
              color="red-darken-1"
              size="x-small"
              class="text-none font-weight-bold mb-2"
              @click="game.unequipItem(hero.id, equipSlot!); equipSlot = null"
            >
              {{ t('equipment.unequip') }} {{ t(SLOT_LABELS[equipSlot]) }}
            </v-btn>
            <!-- Available items from inventory for this slot -->
            <div v-if="inventoryForSlot.length > 0" class="eq-pick-list">
              <div
                v-for="item in inventoryForSlot"
                :key="item.uid"
                class="eq-pick-item"
                @click="game.equipItem(hero.id, item.uid); equipSlot = null"
              >
                <span class="eq-pick-icon">{{ item.icon }}</span>
                <span class="eq-pick-name" :style="{ color: getItemColor(item) }">{{ getItemDisplayName(item) }}</span>
                <span class="eq-pick-level">{{ t('equipment.level') }}{{ item.level }}</span>
                <v-btn variant="flat" color="blue-darken-1" size="x-small" class="text-none font-weight-bold">
                  {{ t('equipment.equip') }}
                </v-btn>
              </div>
            </div>
            <p v-else class="eq-no-items">{{ t('equipment.inventoryEmpty') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rumors -->
    <div class="section-block">
      <h3 class="section-label">{{ t('tavern.rumors') }}</h3>
      <div class="rumor-card">
        <v-icon size="16" color="amber-darken-2" class="mr-2">mdi-message-alert</v-icon>
        <span>{{ t('tavern.rumor1') }}</span>
      </div>
      <div class="rumor-card">
        <v-icon size="16" color="amber-darken-2" class="mr-2">mdi-message-alert</v-icon>
        <span>{{ t('tavern.rumor2') }}</span>
      </div>
      <div class="rumor-card">
        <v-icon size="16" color="amber-darken-2" class="mr-2">mdi-message-alert</v-icon>
        <span>{{ t('tavern.rumor3') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore, RARITY_CONFIG, type EquipmentItem, type EquipmentSlotType } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
const { resources, tavernHeroes, guildHeroes, maxHeroes } = storeToRefs(game);

const SLOT_LABELS: Record<EquipmentSlotType, string> = {
  rightHand: 'equipment.slotRightHand',
  leftHand: 'equipment.slotLeftHand',
  armor: 'equipment.slotArmor',
  helmet: 'equipment.slotHelmet',
  boots: 'equipment.slotBoots',
  accessory: 'equipment.slotAccessory',
};
const EQUIPMENT_SLOTS: EquipmentSlotType[] = ['rightHand', 'leftHand', 'armor', 'helmet', 'boots', 'accessory'];
const SLOT_ICONS: Record<EquipmentSlotType, string> = {
  rightHand: '🗡️', leftHand: '🛡️', armor: '🦺', helmet: '⛑️', boots: '🥾', accessory: '💍',
};

/** Which hero's equipment is being managed (null = none) */
const equipHeroId = ref<number | null>(null);
/** Which slot to show items for (null = none) */
const equipSlot = ref<EquipmentSlotType | null>(null);

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

/** Items matching the slot we want to equip from inventory */
const inventoryForSlot = computed(() => {
  if (!equipSlot.value) return game.inventory;
  return game.inventory.filter((i) => i.slot === equipSlot.value);
});
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner {
  max-width: 768px;
  margin: 0 auto;
}

.production-title {
  font-size: 24px;
  font-weight: 300;
  color: var(--text-heading);
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: -24px 0 32px;
}

.section-block {
  margin-bottom: 40px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.profile-description {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.action-card {
  border: 1px solid var(--border-primary);
  background: var(--bg-surface);
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s ease, background-color 0.3s ease;
  margin-bottom: 16px;

  &:hover {
    border-color: var(--border-hover);
  }
}

.action-title {
  font-weight: 700;
  color: var(--text-heading);
  font-size: 14px;
}

.action-cost {
  font-size: 12px;
  color: var(--text-faint);
}

.action-btn {
  min-width: 100px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 8px;
}

.empty-text {
  font-size: 13px;
  color: var(--text-faint);
  text-align: center;
}

.rumor-card {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  border: 1px solid var(--border-primary);
  border-left: 3px solid #f59e0b;
  background: var(--bg-surface);
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--text-body);
  line-height: 1.5;
  transition: border-color 0.15s ease, background-color 0.3s ease;
}

.cost-chip {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.4;
}

.cost-gold {
  background: rgba(251, 191, 36, 0.15);
  color: #b45309;
}

.cost-wood {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.cost-stone {
  background: rgba(148, 163, 184, 0.15);
  color: #475569;
}

// Tavern upgrades
.tavern-upgrade-card {
  flex-direction: column;
  gap: 0;
}

.tavern-upgrade-info {
  flex: 1;
}

.tavern-upgrade-icon {
  font-size: 1.6rem;
}

.tavern-upgrade-action {
  margin-top: 8px;
}

.tavern-bed-status {
  font-size: 0.8rem;
}

.bed-count {
  color: var(--text-secondary);
  font-weight: 600;
}

.bed-maxed {
  color: var(--text-accent, #d97706);
}

.tavern-hint-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  transition: $transition-theme;
}

.tavern-item-cost {
  display: flex;
  gap: 4px;
}

// Hero cards
.hero-card {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-emoji {
  font-size: 24px;
}

.hero-class {
  font-size: 12px;
  font-weight: 600;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.stat-chip {
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  padding: 2px 7px;
  border-radius: 3px;
  background: var(--bg-hover);
  color: var(--text-body);
}

.stat-atk { background: rgba(239, 83, 80, 0.15); color: #ef5350; }
.stat-def { background: rgba(66, 165, 245, 0.15); color: #42a5f5; }
.stat-matk { background: rgba(171, 71, 188, 0.15); color: #ab47bc; }
.stat-mdef { background: rgba(38, 166, 154, 0.15); color: #26a69a; }
.stat-hp { background: rgba(102, 187, 106, 0.15); color: #66bb6a; }
.stat-spd { background: rgba(255, 167, 38, 0.15); color: #ffa726; }

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.position-badge {
  font-size: 9px;
  font-weight: 800;
  font-family: monospace;
  padding: 2px 8px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}
.pos-front { background: rgba(239, 83, 80, 0.18); color: #ef5350; }
.pos-middle { background: rgba(255, 167, 38, 0.18); color: #ffa726; }
.pos-back { background: rgba(66, 165, 245, 0.18); color: #42a5f5; }

.state-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}
.state-healthy { background: rgba(102, 187, 106, 0.15); color: #66bb6a; }
.state-injured { background: rgba(255, 167, 38, 0.15); color: #ffa726; }
.state-poisoned { background: rgba(171, 71, 188, 0.15); color: #ab47bc; }
.state-tired { background: rgba(158, 158, 158, 0.18); color: #9e9e9e; }
.state-seriously_injured { background: rgba(239, 83, 80, 0.2); color: #ef5350; }

.trait-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(255, 213, 79, 0.15);
  color: var(--text-body);
  cursor: help;
}

.hero-hp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hp-bar-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-hover);
  overflow: hidden;
}
.hp-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #66bb6a, #43a047);
  transition: width 0.3s ease;
}
.hp-bar-text {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
}

.hero-recruit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
}

.roster-count {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
  margin-left: 6px;
}

// Equipment grid
.hero-equipment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 4px;
}

.eq-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px dashed var(--border-light);
  background: var(--bg-hover);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  min-height: 54px;
}
.eq-slot:hover { border-color: var(--text-muted); }
.eq-slot-filled { border-style: solid; background: rgba(255, 213, 79, 0.06); }
.eq-slot-active { border-color: #42a5f5; background: rgba(66, 165, 245, 0.08); }

.eq-slot-icon { font-size: 16px; }
.eq-slot-name {
  font-size: 9px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eq-slot-empty { color: var(--text-faint); font-weight: 400; }
.eq-slot-level {
  font-size: 8px;
  font-family: monospace;
  color: var(--text-muted);
}

.eq-action-panel {
  margin-top: 6px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-card);
}

.eq-pick-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eq-pick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  background: var(--bg-hover);
  cursor: pointer;
  transition: background 0.15s;
}
.eq-pick-item:hover { background: rgba(66, 165, 245, 0.1); }

.eq-pick-icon { font-size: 14px; }
.eq-pick-name { font-size: 11px; font-weight: 600; flex: 1; }
.eq-pick-level { font-size: 9px; font-family: monospace; color: var(--text-muted); }

.eq-no-items {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  padding: 8px 0;
}
</style>
