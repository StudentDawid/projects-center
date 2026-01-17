<template>
  <div v-if="card" class="card-container" :class="`card-type-${card.type}`">
    <div class="card-inner group">
      <!-- Weapon Card Design - Based on code.html -->
      <template
        v-if="
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'weapon'
        "
      >
        <!-- Header with diagonal stripes -->
        <div class="weapon-header">
          <div class="weapon-header-diagonal" />
          <div class="weapon-header-content">
            <div class="weapon-header-text">
              <h2 class="weapon-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="weapon-header-icon">
              <span class="material-symbols-outlined">swords</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="weapon-illustration">
          <div v-if="card.image" class="weapon-image">
            <img :src="card.image" :alt="card.name" />
            <div class="weapon-image-gradient" />
          </div>
          <div v-else class="weapon-image-placeholder">
            <span class="material-symbols-outlined">swords</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="weapon-stats-bar">
          <div v-if="getStatRequirements(card)" class="weapon-stat-item">
            <span class="weapon-stat-icon material-symbols-outlined"
              >target</span
            >
            <span class="weapon-stat-text">{{
              getStatRequirements(card)
            }}</span>
          </div>
          <div
            v-if="getStatRequirements(card) || getWeaponDamage(card)"
            class="weapon-stat-separator"
          />
          <div v-if="getWeaponDamage(card)" class="weapon-stat-item">
            <span class="weapon-stat-icon material-symbols-outlined"
              >sword_rose</span
            >
            <span class="weapon-stat-text">{{ getWeaponDamage(card) }}</span>
            <span
              v-if="getDamageTypeIcon(card)"
              class="weapon-damage-type-icon material-symbols-outlined"
              :title="getDamageTypeLabel(card)"
              :style="{ color: getDamageTypeColor(card) }"
            >
              {{ getDamageTypeIcon(card) }}
            </span>
          </div>
          <div
            v-if="getWeaponDamage(card) && getWeaponHands(card)"
            class="weapon-stat-separator"
          />
          <div
            v-if="getWeaponHands(card)"
            class="weapon-stat-item weapon-stat-item-right"
          >
            <span class="weapon-stat-icon material-symbols-outlined">{{
              getWeaponHandsIcon(card)
            }}</span>
            <span class="weapon-stat-text">{{ getWeaponHands(card) }}</span>
          </div>
        </div>

        <!-- Body Content -->
        <div class="weapon-body">
          <div class="weapon-body-bg-icon">
            <span class="material-symbols-outlined">swords</span>
          </div>
          <div class="weapon-body-content">
            <!-- Description -->
            <div class="weapon-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div class="weapon-footer">
            <p v-if="getCardFlavor(card)" class="weapon-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="weapon-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="weapon-footer-cost"
                >COST: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="weapon-footer-cost"
                >COST: {{ card.sellValue }} ZNT</span
              >
              <span class="weapon-footer-rarity">{{
                getRarityLabel(card.rarity).toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Armor Card Design -->
      <template
        v-else-if="
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'armor'
        "
      >
        <!-- Header with diagonal stripes -->
        <div class="armor-header">
          <div class="armor-header-diagonal" />
          <div class="armor-header-content">
            <div class="armor-header-text">
              <h2 class="armor-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="armor-header-icon">
              <span class="material-symbols-outlined">shield</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area with DEF/M.DEF badges -->
        <div class="armor-illustration">
          <div v-if="card.image" class="armor-image">
            <img :src="card.image" :alt="card.name" />
            <div class="armor-image-gradient" />
          </div>
          <div v-else class="armor-image-placeholder">
            <span class="material-symbols-outlined">shield</span>
          </div>

          <!-- DEF Badge -->
          <div v-if="getArmorDefense(card)" class="armor-def-badge">
            <div class="armor-badge-label">DEF</div>
            <div class="armor-badge-value">{{ getArmorDefense(card) }}</div>
          </div>

          <!-- M.DEF Badge -->
          <div v-if="getArmorMagicDefense(card)" class="armor-mdef-badge">
            <div class="armor-badge-label">M.DEF</div>
            <div class="armor-badge-value">{{ getArmorMagicDefense(card) }}</div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="armor-stats-bar">
          <div v-if="getArmorMight(card)" class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">lock</span>
            <span class="armor-stat-text">{{ getArmorMight(card) }}</span>
          </div>
          <div
            v-if="getArmorMight(card) && getArmorInitiative(card)"
            class="armor-stat-separator"
          />
          <div v-if="getArmorInitiative(card)" class="armor-stat-item armor-stat-item-right">
            <span class="armor-stat-icon material-symbols-outlined">visibility</span>
            <span class="armor-stat-text">{{ getArmorInitiative(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="armor-body">
          <div class="armor-body-bg-icon">
            <span class="material-symbols-outlined">shield</span>
          </div>
          <div class="armor-body-content">
            <!-- Properties Title -->
            <div class="armor-properties-title">PROPERTIES</div>

            <!-- Description -->
            <div class="armor-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div class="armor-footer">
            <p v-if="getCardFlavor(card)" class="armor-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="armor-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="armor-footer-cost"
                >COST: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="armor-footer-cost"
                >COST: {{ card.sellValue }} ZNT</span
              >
              <span class="armor-footer-rarity">{{
                getRarityLabel(card.rarity).toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Other card types (temporary - will be updated later) -->
      <template v-else>
        <!-- Card Header -->
        <div class="card-header" :class="getHeaderClass(card)">
          <div class="header-left">
            <span class="material-symbols-outlined header-icon">{{
              getTypeIcon(card.type)
            }}</span>
            <span class="header-title">{{ getCardTitle(card) }}</span>
          </div>
          <span class="header-cost">{{ getCardCost(card) }}</span>
        </div>

        <!-- Card Image Area -->
        <div class="card-image-area">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
          </div>
          <div
            v-else
            :class="`placeholder-${card.type}`"
            class="image-placeholder"
          >
            <span class="material-symbols-outlined placeholder-icon">{{
              getTypeIcon(card.type)
            }}</span>
          </div>
          <div class="image-overlay" />
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <!-- Equipment specific: Category and Stats -->
          <div
            v-if="card.type === CardTypeEnum.EQUIPMENT && 'stats' in card"
            class="card-stats-row"
          >
            <span class="stat-category">{{ getCardCategory(card) }}</span>
            <span class="stat-value">{{ getCardMetaValue(card) }}</span>
          </div>

          <!-- Spell/Skill specific: School and Type -->
          <div
            v-if="
              (card.type === CardTypeEnum.SPELL ||
                card.type === CardTypeEnum.SKILL) &&
              'school' in card
            "
            class="card-stats-row"
          >
            <span class="stat-category">{{
              card.school || getCardCategory(card)
            }}</span>
            <span class="stat-value">{{ getCardMetaValue(card) }}</span>
          </div>

          <!-- Quest specific: Level and Type -->
          <div
            v-if="card.type === CardTypeEnum.QUEST && 'level' in card"
            class="card-stats-row"
          >
            <span class="stat-category">Level {{ card.level }}</span>
            <span class="stat-value">{{
              card.isMainQuest ? 'Main' : 'Side'
            }}</span>
          </div>

          <!-- Item specific: Rarity -->
          <div
            v-if="card.type === CardTypeEnum.ITEM && 'rarity' in card"
            class="card-stats-row"
          >
            <span class="stat-category">{{ getRarityLabel(card.rarity) }}</span>
            <span
              v-if="'consumable' in card && card.consumable"
              class="stat-value"
              >Consumable</span
            >
          </div>

          <!-- Description -->
          <div class="card-description">
            <p v-html="formatDescription(card.description)" />
          </div>

          <!-- Flavor Text -->
          <div v-if="getCardFlavor(card)" class="card-flavor">
            <em>{{ getCardFlavor(card) }}</em>
          </div>
        </div>
      </template>

      <!-- Hover Controls -->
      <div v-if="showControls" class="card-controls">
        <button
          class="control-btn edit"
          title="Edytuj"
          @click.stop="$emit('edit', card)"
        >
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button
          class="control-btn duplicate"
          title="Kopiuj"
          @click.stop="$emit('duplicate', card)"
        >
          <span class="material-symbols-outlined">content_copy</span>
        </button>
        <button
          class="control-btn delete"
          title="Usuń"
          @click.stop="$emit('delete', card)"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Card,
  CardType,
  Rarity,
} from '~/shared/fabula-ultima-card-generator/types/card.types';
import {
  CardType as CardTypeEnum,
  Rarity as RarityEnum,
  DamageType as DamageTypeEnum,
  AccuracyStat as AccuracyStatEnum,
  WeaponType as WeaponTypeEnum,
} from '~/shared/fabula-ultima-card-generator/types/card.types';

withDefaults(
  defineProps<{
    card: Card;
    showControls?: boolean;
  }>(),
  {
    showControls: true,
  }
);

defineEmits<{
  edit: [card: Card];
  duplicate: [card: Card];
  delete: [card: Card];
}>();

function getTypeIcon(type: CardType): string {
  const icons: Record<CardType, string> = {
    [CardTypeEnum.EQUIPMENT]: 'swords',
    [CardTypeEnum.SPELL]: 'auto_fix',
    [CardTypeEnum.SKILL]: 'school',
    [CardTypeEnum.QUEST]: 'task_alt',
    [CardTypeEnum.ITEM]: 'inventory_2',
    [CardTypeEnum.NPC]: 'face',
    [CardTypeEnum.LOCATION]: 'place',
  };
  return icons[type] || 'help';
}

function getHeaderClass(card: Card): string {
  if (card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
    if (card.slot === 'weapon') return 'header-weapon';
    if (card.slot === 'armor') return 'header-armor';
  }
  return `header-${card.type}`;
}

function getCardTitle(card: Card): string {
  return card.name.toUpperCase();
}

function getCardCost(card: Card): string {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'buyValue' in card &&
    card.buyValue
  ) {
    return `${card.buyValue} ZNT`;
  }
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'sellValue' in card &&
    card.sellValue
  ) {
    return `${card.sellValue} ZNT`;
  }
  if (
    card.type === CardTypeEnum.SPELL &&
    'mpCost' in card &&
    card.mpCost !== undefined
  ) {
    return `${card.mpCost} MP`;
  }
  if (
    card.type === CardTypeEnum.SKILL &&
    'fpCost' in card &&
    card.fpCost !== undefined
  ) {
    return `SL ${card.fpCost}`;
  }
  if (card.type === CardTypeEnum.QUEST && 'level' in card) {
    return `Lv.${card.level}`;
  }
  if (card.type === CardTypeEnum.ITEM && 'buyValue' in card && card.buyValue) {
    return `${card.buyValue}z`;
  }
  return '';
}

function getCardCategory(card: Card): string {
  if (card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
    const categories: Record<string, string> = {
      weapon: 'Martial Melee',
      armor: 'Heavy Armor',
      shield: 'Defensive',
      accessory: 'Accessory',
      helmet: 'Headgear',
      boots: 'Footwear',
      gloves: 'Handwear',
    };
    return categories[card.slot] || 'Equipment';
  }
  if (card.type === CardTypeEnum.SPELL && 'school' in card && card.school) {
    return card.school;
  }
  if (card.type === CardTypeEnum.SKILL && 'category' in card && card.category) {
    return card.category;
  }
  return card.type.toUpperCase();
}

function getCardMetaValue(card: Card): string {
  if (card.type === CardTypeEnum.EQUIPMENT && 'stats' in card && card.stats) {
    if (card.stats.magic) return `MR + ${card.stats.magic}`;
    if (card.stats.damage) {
      const modifier =
        card.stats.damage.modifier > 0
          ? ` + ${card.stats.damage.modifier}`
          : '';
      return `HR${modifier}`;
    }
  }
  if (card.type === CardTypeEnum.SPELL && 'range' in card) {
    const rangeLabels: Record<string, string> = {
      self: 'Self',
      single: 'Single',
      area: 'Area',
      all: 'All',
    };
    return rangeLabels[card.range] || 'Instant';
  }
  if (card.type === CardTypeEnum.SKILL) {
    return 'Passive';
  }
  return '';
}

function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    [RarityEnum.COMMON]: 'Powszechna',
    [RarityEnum.RARE]: 'Rzadka',
    [RarityEnum.EPIC]: 'Epicka',
    [RarityEnum.LEGENDARY]: 'Legendarna',
    [RarityEnum.DIVINE]: 'Boska',
  };
  return labels[rarity] || 'Powszechna';
}

function getCardFlavor(card: Card): string {
  return card.flavorText || '';
}

function formatDescription(text: string): string {
  // Proste formatowanie markdown-like
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function getWeaponCategory(card: Card): string {
  if (card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
    const categories: Record<string, string> = {
      weapon: 'MELEE WEAPON · SWORD',
      armor: 'ARMOR',
      shield: 'SHIELD',
      accessory: 'ACCESSORY',
      helmet: 'HELMET',
      boots: 'BOOTS',
      gloves: 'GLOVES',
    };
    return categories[card.slot] || 'EQUIPMENT';
  }
  return '';
}

function getStatRequirements(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.accuracy
  ) {
    const accuracy = card.stats.accuracy;
    const statLabels: Record<string, string> = {
      zr: 'ZR',
      po: 'PO',
      wj: 'WJ',
      sw: 'SW',
    };
    const stat1 = statLabels[accuracy.stat1] || accuracy.stat1.toUpperCase();
    const stat2 = statLabels[accuracy.stat2] || accuracy.stat2.toUpperCase();
    const modifier = accuracy.modifier > 0 ? ` +${accuracy.modifier}` : '';
    return `【${stat1} + ${stat2}】${modifier}`;
  }
  return null;
}

function getWeaponHands(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'slot' in card &&
    card.slot === 'weapon' &&
    'weaponHands' in card &&
    card.weaponHands
  ) {
    return card.weaponHands === 'one_handed' ? '1-H' : '2-H';
  }
  return null;
}

function getWeaponHandsIcon(card: Card): string {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'slot' in card &&
    card.slot === 'weapon' &&
    'weaponType' in card &&
    card.weaponType
  ) {
    // If weapon is ranged, show bow/archery icon, otherwise show sword icon
    // Using 'my_location' (crosshair/target) as a ranged weapon representation
    return card.weaponType === WeaponTypeEnum.RANGED ? 'my_location' : 'swords';
  }
  // Default to hand gesture if weapon type is not available
  return 'hand_gesture';
}

function getWeaponDamage(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.damage
  ) {
    const damage = card.stats.damage;
    const modifier = damage.modifier > 0 ? ` + ${damage.modifier}` : '';
    return `【HR${modifier}】`;
  }
  return null;
}

function getDamageTypeIcon(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.damage
  ) {
    const damageType = card.stats.damage.type;
    const icons: Record<string, string> = {
      [DamageTypeEnum.PHYSICAL]: 'cut',
      [DamageTypeEnum.FIRE]: 'local_fire_department',
      [DamageTypeEnum.ICE]: 'ac_unit',
      [DamageTypeEnum.ELECTRIC]: 'bolt',
      [DamageTypeEnum.POISON]: 'science',
      [DamageTypeEnum.EARTH]: 'landscape',
      [DamageTypeEnum.LIGHT]: 'light_mode',
      [DamageTypeEnum.DARK]: 'dark_mode',
      [DamageTypeEnum.AIR]: 'air',
    };
    return icons[damageType] || null;
  }
  return null;
}

function getDamageTypeLabel(card: Card): string {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.damage
  ) {
    const damageType = card.stats.damage.type;
    const labels: Record<string, string> = {
      [DamageTypeEnum.PHYSICAL]: 'Fizyczne',
      [DamageTypeEnum.FIRE]: 'Ogniste',
      [DamageTypeEnum.ICE]: 'Lodowe',
      [DamageTypeEnum.ELECTRIC]: 'Elektryczne',
      [DamageTypeEnum.POISON]: 'Trujące',
      [DamageTypeEnum.EARTH]: 'Ziemne',
      [DamageTypeEnum.LIGHT]: 'Świetliste',
      [DamageTypeEnum.DARK]: 'Mroczne',
      [DamageTypeEnum.AIR]: 'Powietrzne',
    };
    return labels[damageType] || '';
  }
  return '';
}

function getDamageTypeColor(card: Card): string {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.damage
  ) {
    const damageType = card.stats.damage.type;
    const colors: Record<string, string> = {
      [DamageTypeEnum.PHYSICAL]: '#8b6d4c', // Brązowy (domyślny)
      [DamageTypeEnum.FIRE]: '#ff6b35', // Pomarańczowy/czerwony
      [DamageTypeEnum.ICE]: '#4fc3f7', // Jasnoniebieski
      [DamageTypeEnum.ELECTRIC]: '#ffeb3b', // Żółty
      [DamageTypeEnum.POISON]: '#81c784', // Jasnozielony
      [DamageTypeEnum.EARTH]: '#8d6e63', // Brązowy ziemny
      [DamageTypeEnum.LIGHT]: '#fff9c4', // Jasnożółty/żółtobiały
      [DamageTypeEnum.DARK]: '#5c6bc0', // Ciemnoniebieski/fioletowy
      [DamageTypeEnum.AIR]: '#b0bec5', // Szary/błękitny
    };
    return colors[damageType] || '#8b6d4c';
  }
  return '#8b6d4c';
}

// Armor Card Helper Functions
function getArmorCategory(card: Card): string {
  if (card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
    const categories: Record<string, string> = {
      armor: 'HEAVY ARMOR',
      shield: 'SHIELD',
      helmet: 'HELMET',
      boots: 'BOOTS',
      gloves: 'GLOVES',
    };
    return categories[card.slot] || 'ARMOR';
  }
  return '';
}

function formatArmorDefense(defense: any): string {
  if (!defense) return '';

  // Jeśli jest stała wartość
  if (defense.fixedValue !== undefined) {
    return defense.fixedValue.toString();
  }

  // Jeśli jest kość z modyfikatorem
  if (defense.die) {
    const statLabels: Record<string, string> = {
      [AccuracyStatEnum.ZR]: 'ZR',
      [AccuracyStatEnum.PO]: 'PO',
      [AccuracyStatEnum.WJ]: 'WJ',
      [AccuracyStatEnum.SW]: 'SW',
    };
    const statLabel = statLabels[defense.die] || '';
    const modifier = defense.modifier || 0;

    if (modifier === 0) {
      return `Kość ${statLabel}`;
    } else if (modifier > 0) {
      return `Kość ${statLabel} + ${modifier}`;
    } else {
      return `Kość ${statLabel} - ${Math.abs(modifier)}`;
    }
  }

  return '';
}

function getArmorDefense(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.defense
  ) {
    return formatArmorDefense(card.stats.defense);
  }
  return null;
}

function getArmorMagicDefense(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.magicDefense
  ) {
    return formatArmorDefense(card.stats.magicDefense);
  }
  return null;
}

function getArmorMight(card: Card): string | null {
  // Might będzie w requirements, na razie zwracamy placeholder
  // TODO: Implementować gdy requirements będą gotowe
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'requirements' in card &&
    card.requirements
  ) {
    // Placeholder - zwracamy "Might d10" jeśli jest w requirements
    return 'Might d10';
  }
  return null;
}

function getArmorInitiative(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'stats' in card &&
    card.stats?.initiative !== undefined
  ) {
    const initiative = card.stats.initiative;
    if (initiative === null) {
      return '-';
    }
    if (initiative > 0) {
      return `+${initiative} Init`;
    } else if (initiative < 0) {
      return `${initiative} Init`;
    } else {
      return '0 Init';
    }
  }
  return null;
}
</script>

<style scoped lang="scss">
.card-container {
  aspect-ratio: 63 / 88;
  width: 100%;
  position: relative;
  display: block;
}

.card-inner {
  height: 100%;
  width: 100%;
  border-radius: 12px;
  border: 6px solid #2a2a2a;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  font-family: 'Epilogue', sans-serif;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  // Gradient overlay for weapon cards
  &.card-type-equipment::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to top right,
      transparent,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.2)
    );
    pointer-events: none;
    mix-blend-mode: overlay;
    z-index: 20;
  }
}

// Weapon Card Header - Exact match from code.html
.weapon-header {
  background: #8b6d4c;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;

  .weapon-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      #000 10px,
      #000 12px
    );
  }

  .weapon-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .weapon-header-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .weapon-name {
    color: white;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
  }

  .weapon-category {
    color: rgba(255, 255, 255, 0.9);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .weapon-header-icon {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 6px;
    flex-shrink: 0;
    margin-left: 8px;

    .material-symbols-outlined {
      color: white;
      font-size: 20px;
      display: block;
    }
  }
}

// Card Header Styles (for other card types)
.card-header {
  height: 28px;
  min-height: 28px;
  border-bottom: 2px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }

  // Weapon (Gold)
  &.header-weapon,
  &.header-equipment {
    background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // Armor (Darker Gold/Bronze)
  &.header-armor {
    background: linear-gradient(135deg, #b8941f 0%, #9a7a1a 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  // Spell (Blue/Teal)
  &.header-spell {
    background: linear-gradient(135deg, #4a8c8c 0%, #3a6b6b 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // Skill (Teal/Green)
  &.header-skill {
    background: linear-gradient(135deg, #296a6a 0%, #1d4f4f 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // Quest (Gold/Orange)
  &.header-quest {
    background: linear-gradient(135deg, #d4af37 0%, #c4941f 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // Item (Gray/Silver)
  &.header-item {
    background: linear-gradient(135deg, #94a3b8 0%, #748294 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // NPC (Red/Burgundy)
  &.header-npc {
    background: linear-gradient(135deg, #c23e2a 0%, #a02e1a 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  // Location (Blue)
  &.header-location {
    background: linear-gradient(135deg, #4a8c8c 0%, #3a6b6b 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.header-icon {
  font-size: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

.header-title {
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.header-cost {
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-left: 4px;
}

// Weapon Card Illustration - Exact match from code.html
.weapon-illustration {
  height: 176px;
  width: 100%;
  background: #2a2a2a;
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #2a2a2a;
  z-index: 2;

  .weapon-image {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0.9;
      mix-blend-mode: normal;
      filter: brightness(1.1);
    }

    .weapon-image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to top, #2a2a2a, transparent);
    }
  }

  .weapon-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .material-symbols-outlined {
      font-size: 64px;
      color: rgba(255, 255, 255, 0.2);
    }
  }
}

// Card Image Area (for other card types)
.card-image-area {
  height: 96px;
  width: 100%;
  background: #f5f5f5;
  border-bottom: 2px solid #1e293b;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.card-image {
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .placeholder-icon {
    font-size: 48px;
    opacity: 0.4;
    filter: grayscale(0.3);
  }

  // Weapon placeholder
  &.placeholder-equipment {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  }

  // Spell placeholder
  &.placeholder-spell {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
  }

  // Skill placeholder
  &.placeholder-skill {
    background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 50%, #5eead4 100%);
  }

  // Quest placeholder
  &.placeholder-quest {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  }

  // Item placeholder
  &.placeholder-item {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
  }

  // NPC placeholder
  &.placeholder-npc {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%);
  }

  // Location placeholder
  &.placeholder-location {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
  }
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  pointer-events: none;
}

// Card Body
.card-body {
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fefefe;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.015) 2px,
      rgba(0, 0, 0, 0.015) 4px
    ),
    linear-gradient(to bottom, #fefefe 0%, #fafafa 100%);
  min-height: 0;
  position: relative;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(0, 0, 0, 0.05),
      transparent
    );
  }
}

// Weapon Card Stats Bar - Exact match from code.html
.weapon-stats-bar {
  background: #2a2a2a;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #374151;
  font-size: 11px;
  font-weight: 700;
  color: white;
  z-index: 2;
  min-width: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;

  .weapon-stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-width: 0;

    &.weapon-stat-item-right {
      margin-left: auto;
      color: #d1d5db;
      flex-shrink: 0;
    }

    .weapon-stat-icon {
      font-size: 12px;
      color: #8b6d4c;
      flex-shrink: 0;
    }

    .weapon-stat-text {
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex-shrink: 0;
      overflow: visible;
    }

    .weapon-damage-type-icon {
      font-size: 12px;
      flex-shrink: 0;
      margin-left: 2px;
    }
  }

  .weapon-stat-separator {
    width: 1px;
    height: 12px;
    background: #4b5563;
    flex-shrink: 0;
  }
}

.card-stats-row {
  font-size: 9px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 3px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-category {
  font-size: 9px;
  color: #475569;
}

.stat-value {
  font-size: 9px;
  color: #1e293b;
  font-weight: 700;
}

// Weapon Card Body - Exact match from code.html
.weapon-body {
  flex: 1;
  background: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  overflow: hidden;

  .weapon-body-bg-icon {
    position: absolute;
    right: -20px;
    bottom: -20px;
    color: #f3f4f6;
    opacity: 0.08;
    z-index: 1;

    .material-symbols-outlined {
      font-size: 200px;
    }
  }

  .weapon-body-content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .weapon-description {
    color: #111818;
    font-size: 14px;
    line-height: 1.625;
    font-weight: 500;
    margin-bottom: 16px;

    p {
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(strong) {
      font-weight: 700;
    }
  }

  .weapon-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
    position: relative;
    z-index: 10;

    .weapon-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .weapon-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .weapon-footer-cost {
      color: #9ca3af;
    }

    .weapon-footer-rarity {
      color: #9ca3af;
    }
  }
}

// Hover Controls
.card-controls {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 20;
}

.group:hover .card-controls {
  opacity: 1;
}

.control-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  &.delete {
    background: #1e293b;
    color: white;

    &:hover {
      background: #ef4444;
      transform: scale(1.1);
    }
  }

  &.edit {
    background: #296a6a;
    color: white;

    &:hover {
      background: #1d4f4f;
      transform: scale(1.1);
    }
  }

  &.duplicate {
    background: #1e293b;
    color: white;

    &:hover {
      background: #4a8c8c;
      transform: scale(1.1);
    }
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
}

// Armor Card Styles - Based on armor card.png design
.armor-header {
  background: #2a2a2a;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;

  .armor-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      #000 10px,
      #000 12px
    );
  }

  .armor-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .armor-header-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .armor-name {
    color: white;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
  }

  .armor-category {
    color: rgba(255, 255, 255, 0.9);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .armor-header-icon {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 6px;
    flex-shrink: 0;
    margin-left: 8px;

    .material-symbols-outlined {
      color: white;
      font-size: 20px;
      display: block;
    }
  }
}

.armor-illustration {
  height: 176px;
  width: 100%;
  background: #2a2a2a;
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #2a2a2a;
  z-index: 2;

  .armor-image {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0.9;
      mix-blend-mode: normal;
      filter: brightness(1.1);
    }

    .armor-image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to top, #2a2a2a, transparent);
    }
  }

  .armor-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .material-symbols-outlined {
      font-size: 64px;
      color: rgba(255, 255, 255, 0.2);
    }
  }

  // DEF and M.DEF Badges
  .armor-def-badge,
  .armor-mdef-badge {
    position: absolute;
    top: 12px;
    background: white;
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  .armor-def-badge {
    left: 12px;
  }

  .armor-mdef-badge {
    right: 12px;
  }

  .armor-badge-label {
    font-size: 9px;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .armor-badge-value {
    font-size: 18px;
    font-weight: 900;
    color: #1e293b;
    line-height: 1;
  }
}

.armor-stats-bar {
  background: #2a2a2a;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #374151;
  font-size: 11px;
  font-weight: 700;
  color: white;
  z-index: 2;
  min-width: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;

  .armor-stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-width: 0;

    &.armor-stat-item-right {
      margin-left: auto;
      color: #d1d5db;
      flex-shrink: 0;
    }

    .armor-stat-icon {
      font-size: 12px;
      color: #8b6d4c;
      flex-shrink: 0;
    }

    .armor-stat-text {
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex-shrink: 0;
      overflow: visible;
    }
  }

  .armor-stat-separator {
    width: 1px;
    height: 12px;
    background: #4b5563;
    flex-shrink: 0;
  }
}

.armor-body {
  flex: 1;
  background: #f5f5f5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  overflow: hidden;

  .armor-body-bg-icon {
    position: absolute;
    right: -20px;
    bottom: -20px;
    color: rgba(0, 0, 0, 0.03);
    opacity: 0.5;
    z-index: 1;

    .material-symbols-outlined {
      font-size: 200px;
    }
  }

  .armor-body-content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .armor-properties-title {
    font-size: 9px;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }

  .armor-description {
    color: #111818;
    font-size: 14px;
    line-height: 1.625;
    font-weight: 500;
    margin-bottom: 16px;

    p {
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(strong) {
      font-weight: 700;
      color: #ef4444;
    }
  }

  .armor-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    position: relative;
    z-index: 10;

    .armor-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .armor-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .armor-footer-cost {
      color: #1e293b;
    }

    .armor-footer-rarity {
      color: #1e293b;
    }
  }
}
</style>
