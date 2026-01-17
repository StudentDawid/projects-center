<template>
  <div v-if="card" class="card-container" :class="`card-type-${card.type}`">
    <div
      class="card-inner"
      :class="{
        'card-armor':
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'armor',
        'card-weapon':
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'weapon',
        'card-shield':
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'shield',
        'card-accessory':
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'accessory',
        'card-spell':
          card.type === CardTypeEnum.SPELL,
      }"
    >
      <!-- Weapon Card Design - Based on code.html -->
      <template
        v-if="
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'weapon'
        "
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="weapon-header">
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
            <div v-if="card.description && card.description.trim()" class="weapon-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="weapon-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
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
        <div v-if="card.name && card.name.trim()" class="armor-header">
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

        <!-- Illustration Area -->
        <div class="armor-illustration">
          <div v-if="card.image" class="armor-image">
            <img :src="card.image" :alt="card.name" />
            <div class="armor-image-gradient" />
          </div>
          <div v-else class="armor-image-placeholder">
            <span class="material-symbols-outlined">shield</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="armor-stats-bar">
          <div v-if="getArmorDefense(card)" class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">shield</span>
            <span class="armor-stat-text">DEF {{ getArmorDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorDefense(card) && getArmorMagicDefense(card)"
            class="armor-stat-separator"
          />
          <div v-if="getArmorMagicDefense(card)" class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">auto_awesome</span>
            <span class="armor-stat-text">M.DEF {{ getArmorMagicDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorMagicDefense(card)"
            class="armor-stat-separator"
          />
          <div class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">visibility</span>
            <span class="armor-stat-text">{{ getArmorInitiative(card) || '-' }}</span>
          </div>
          <div
            v-if="getArmorMight(card)"
            class="armor-stat-separator"
          />
          <div v-if="getArmorMight(card)" class="armor-stat-item armor-stat-item-right">
            <span class="armor-stat-icon material-symbols-outlined">lock</span>
            <span class="armor-stat-text">{{ getArmorMight(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="armor-body">
          <div class="armor-body-bg-icon">
            <span class="material-symbols-outlined">shield</span>
          </div>
          <div class="armor-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="armor-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="armor-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
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

      <!-- Shield Card Design -->
      <template
        v-else-if="
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'shield'
        "
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="armor-header">
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

        <!-- Illustration Area -->
        <div class="armor-illustration">
          <div v-if="card.image" class="armor-image">
            <img :src="card.image" :alt="card.name" />
            <div class="armor-image-gradient" />
          </div>
          <div v-else class="armor-image-placeholder">
            <span class="material-symbols-outlined">shield</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="armor-stats-bar">
          <div v-if="getArmorDefense(card)" class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">shield</span>
            <span class="armor-stat-text">DEF +{{ getShieldDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorDefense(card) && getArmorMagicDefense(card)"
            class="armor-stat-separator"
          />
          <div v-if="getArmorMagicDefense(card)" class="armor-stat-item">
            <span class="armor-stat-icon material-symbols-outlined">auto_awesome</span>
            <span class="armor-stat-text">M.DEF +{{ getShieldMagicDefense(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="armor-body">
          <div class="armor-body-bg-icon">
            <span class="material-symbols-outlined">shield</span>
          </div>
          <div class="armor-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="armor-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="armor-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
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

      <!-- Accessory Card Design -->
      <template
        v-else-if="
          card.type === CardTypeEnum.EQUIPMENT &&
          'slot' in card &&
          card.slot === 'accessory'
        "
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="accessory-header">
          <div class="accessory-header-diagonal" />
          <div class="accessory-header-content">
            <div class="accessory-header-text">
              <h2 class="accessory-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="accessory-header-icon">
              <span class="material-symbols-outlined">diamond</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="accessory-illustration">
          <div v-if="card.image" class="accessory-image">
            <img :src="card.image" :alt="card.name" />
            <div class="accessory-image-gradient" />
          </div>
          <div v-else class="accessory-image-placeholder">
            <span class="material-symbols-outlined">diamond</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="accessory-body">
          <div class="accessory-body-bg-icon">
            <span class="material-symbols-outlined">diamond</span>
          </div>
          <div class="accessory-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="accessory-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="accessory-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="accessory-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="accessory-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="accessory-footer-cost"
                >COST: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="accessory-footer-cost"
                >COST: {{ card.sellValue }} ZNT</span
              >
              <span class="accessory-footer-rarity">{{
                getRarityLabel(card.rarity).toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Spell Card Design -->
      <template
        v-else-if="card.type === CardTypeEnum.SPELL"
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="spell-header">
          <div class="spell-header-diagonal" />
          <div class="spell-header-content">
            <div class="spell-header-text">
              <h2 class="spell-name">
                {{ card.name.toUpperCase() }}
                <span v-if="(card as any).isOffensive" class="spell-offensive-icon">
                  <span class="material-symbols-outlined">bolt</span>
                </span>
              </h2>
              <p v-if="getSpellType(card)" class="spell-category">{{ getSpellType(card) }}</p>
            </div>
            <div class="spell-header-icon">
              <span class="material-symbols-outlined">auto_fix</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="spell-illustration">
          <div v-if="card.image" class="spell-image">
            <img :src="card.image" :alt="card.name" />
            <div class="spell-image-gradient" />
          </div>
          <div v-else class="spell-image-placeholder">
            <span class="material-symbols-outlined">auto_fix</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'mpCost' in card || 'target' in card || 'duration' in card" class="spell-stats-bar">
          <div v-if="getSpellMpCost(card)" class="spell-stat-item">
            <span class="spell-stat-icon material-symbols-outlined">magic_button</span>
            <span class="spell-stat-text">{{ getSpellMpCost(card) }} PM</span>
          </div>
          <div
            v-if="getSpellMpCost(card) && getSpellTarget(card)"
            class="spell-stat-separator"
          />
          <div v-if="getSpellTarget(card)" class="spell-stat-item">
            <span class="spell-stat-icon material-symbols-outlined">target</span>
            <span class="spell-stat-text">{{ getSpellTarget(card) }}</span>
          </div>
          <div
            v-if="getSpellTarget(card) && getSpellDuration(card)"
            class="spell-stat-separator"
          />
          <div v-if="getSpellDuration(card)" class="spell-stat-item">
            <span class="spell-stat-icon material-symbols-outlined">schedule</span>
            <span class="spell-stat-text">{{ getSpellDuration(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="spell-body">
          <div class="spell-body-bg-icon">
            <span class="material-symbols-outlined">auto_fix</span>
          </div>
          <div class="spell-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="spell-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="spell-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="spell-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="spell-footer-info">
              <span v-if="getSpellElement(card)" class="spell-footer-element">
                ELEMENT: {{ getSpellElement(card) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Other card types (temporary - will be updated later) -->
      <template v-else>
        <!-- Card Header -->
        <div v-if="card.name && card.name.trim()" class="card-header" :class="getHeaderClass(card)">
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

          <!-- Spell/Skill specific: School and Type (only for other card types, not spell card template) -->
          <div
            v-if="
              card.type === CardTypeEnum.SKILL &&
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
    </div>

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
    if (card.slot === 'accessory') return 'header-accessory';
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
      return `WW${modifier}`;
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
    return `【WW${modifier}】`;
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
      [DamageTypeEnum.PHYSICAL]: 'hardware', // Ikona hardware dla obrażeń fizycznych
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
      [DamageTypeEnum.PHYSICAL]: '#e8d5b7', // Jaśniejszy beżowy dla lepszej widoczności na ciemnym tle
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

// Shield defense getters (only fixed values with + prefix)
function getShieldDefense(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'slot' in card &&
    card.slot === 'shield' &&
    'stats' in card &&
    card.stats?.defense
  ) {
    const defense = card.stats.defense;
    if (defense && typeof defense === 'object' && 'fixedValue' in defense) {
      return defense.fixedValue?.toString() || '0';
    }
  }
  return null;
}

function getShieldMagicDefense(card: Card): string | null {
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'slot' in card &&
    card.slot === 'shield' &&
    'stats' in card &&
    card.stats?.magicDefense
  ) {
    const magicDefense = card.stats.magicDefense;
    if (magicDefense && typeof magicDefense === 'object' && 'fixedValue' in magicDefense) {
      return magicDefense.fixedValue?.toString() || '0';
    }
  }
  return null;
}

// Spell helper functions
function getSpellMpCost(card: Card): string | null {
  if (card.type === CardTypeEnum.SPELL && 'mpCost' in card) {
    const mpCost = (card as any).mpCost;
    if (mpCost !== undefined && mpCost !== null) {
      const costStr = typeof mpCost === 'string' ? mpCost : mpCost.toString();
      return costStr.trim() !== '' ? costStr : null;
    }
  }
  return null;
}

function getSpellType(card: Card): string {
  if (card.type === CardTypeEnum.SPELL) {
    return (card as any).isOffensive ? 'OFFENSIVE SPELL' : 'SPELL';
  }
  return '';
}

function getSpellTarget(card: Card): string | null {
  if (card.type === CardTypeEnum.SPELL && 'target' in card) {
    const target = (card as any).target;
    const labels: Record<string, string> = {
      self: 'Ty',
      single: 'Jedna istota',
      three: 'Do trzech istot',
      weapon: 'Jedna broń',
      special: 'Specjalny',
    };
    return labels[target] || null;
  }
  return null;
}

function getSpellDuration(card: Card): string | null {
  if (card.type === CardTypeEnum.SPELL && 'duration' in card) {
    const duration = (card as any).duration;
    if (duration !== undefined && duration !== null) {
      const labels: Record<string, string> = {
        instant: 'Błyskawiczny',
        scene: 'Jedna scena',
      };
      return labels[duration] || null;
    }
  }
  return null;
}

function getSpellElement(card: Card): string | null {
  // TODO: Dodać pole elementu do formularza w przyszłości
  // Na razie zwracamy null lub możemy użyć jakiegoś domyślnego
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
  // Always return a value for armor cards
  if (
    card.type === CardTypeEnum.EQUIPMENT &&
    'slot' in card &&
    card.slot === 'armor'
  ) {
    const initiative = card.stats?.initiative;
    // If initiative is null, undefined, or 0, return '-'
    if (initiative === null || initiative === undefined || initiative === 0) {
      return '-';
    }
    if (initiative > 0) {
      return `+${initiative} Init`;
    } else if (initiative < 0) {
      return `${initiative} Init`;
    }
    return '-';
  }
  return null;
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap');
.card-container {
  aspect-ratio: 63 / 88;
  width: 100%;
  position: relative;
  display: block;

  &:hover .card-controls {
    opacity: 1;
  }
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

  &.card-armor {
    border-color: #64748b; // Stalowy kolor obramowania dla karty pancerza
  }

  &.card-weapon {
    border-color: #8b6d4c; // Brązowy kolor obramowania dla karty broni
  }

  &.card-shield {
    border-color: #64748b; // Stalowy kolor obramowania dla karty tarczy (tak jak pancerz)
  }

  &.card-accessory {
    border-color: #d4af37; // Złoty kolor obramowania dla karty akcesorium
  }

  &.card-spell {
    border-color: #dc2626; // Czerwony kolor obramowania dla karty czaru
  }
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
  font-family: 'Epilogue', sans-serif;

  .weapon-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 200, 150, 0.4) 10px, // Jaśniejszy brązowy zamiast czarnego
      rgba(255, 200, 150, 0.4) 12px
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
    font-family: 'Epilogue', sans-serif !important;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.025em; // tracking-tight jak w HTML
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
  }

  .weapon-category {
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Epilogue', sans-serif !important;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em; // tracking-widest jak w HTML
    text-transform: uppercase;
    margin-top: 2px;
  }

  .weapon-header-icon {
    background: rgba(255, 255, 255, 0.15); // Jaśniejsze tło zamiast czarnego
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
  font-family: 'Epilogue', sans-serif;
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

  // Accessory (Bright Gold)
  &.header-accessory {
    background: linear-gradient(135deg, #f4d03f 0%, #d4af37 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
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
  font-family: 'Epilogue', sans-serif !important;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.header-cost {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-left: 4px;
}

// Weapon Card Illustration - Exact match from code.html
.weapon-illustration {
  flex: 1; // Rozciąga się, aby wypełnić dostępną przestrzeń
  min-height: 176px; // Minimalna wysokość, ale może się rozciągać
  width: 100%;
  background: #6b5a4a; // Ciemniejszy brąz zamiast czarnego
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #6b5a4a;
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
      background: linear-gradient(to top, #6b5a4a, transparent); // Ciemniejszy brąz zamiast czarnego
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
  flex: 1; // Rozciąga się, aby wypełnić dostępną przestrzeń
  min-height: 96px; // Minimalna wysokość, ale może się rozciągać
  width: 100%;
  background: #f5f5f5;
  border-bottom: 2px solid #1e293b;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

// Accessory card image area - gold background
.card-accessory .card-image-area {
  background: #f9e79f; // Jasne złote tło
  border-bottom: 2px solid #d4af37; // Złoty border
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
  background: #6b5a4a; // Ciemniejszy brąz zamiast czarnego
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #8b6d4c; // Brązowy separator
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
      color: #f4d5a6; // Jaśniejszy beżowy kolor dla lepszej widoczności na ciemnym brązowym tle
      flex-shrink: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); // Dodatkowy cień dla lepszej czytelności
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
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4); // Cień dla lepszej widoczności na ciemnym tle
      filter: brightness(1.2); // Zwiększenie jasności dla lepszego kontrastu
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
  flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
  display: flex;
  flex-direction: column;
  background: white;
  padding: 16px;
  position: relative;
  min-height: 0;
  overflow: hidden;
  margin-top: auto; // Przykleja się do dołu karty

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
    flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
    display: flex;
    flex-direction: column;
    min-height: 0; // Usuwa minimalną wysokość
  }

  .weapon-description {
    color: #111818;
    font-size: 14px;
    line-height: 1.625;
    font-weight: 500;
    margin-bottom: 0; // Usunięto margin-bottom, aby nie było pustej przestrzeni

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
    margin-top: 16px; // Zmieniono z auto na stały margin-top
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
    position: relative;
    z-index: 10;

    &.no-content-above {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

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
  z-index: 30;
  pointer-events: none;

  .control-btn {
    pointer-events: all;
  }
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
  background: #64748b; // Stalowy szary zamiast czarnego
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  font-family: 'Epilogue', sans-serif;

  .armor-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.3) 10px, // Jaśniejszy stalowy zamiast czarnego
      rgba(255, 255, 255, 0.3) 12px
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
    font-family: 'Epilogue', sans-serif !important;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.025em; // tracking-tight jak w HTML
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
  }

  .armor-category {
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Epilogue', sans-serif !important;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em; // tracking-widest jak w HTML
    text-transform: uppercase;
    margin-top: 2px;
  }

  .armor-header-icon {
    background: rgba(255, 255, 255, 0.15); // Jaśniejsze tło zamiast czarnego
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
  flex: 1; // Rozciąga się, aby wypełnić dostępną przestrzeń
  min-height: 176px; // Minimalna wysokość, ale może się rozciągać
  width: 100%;
  background: #475569; // Stalowy szary zamiast czarnego
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #475569;
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
      background: linear-gradient(to top, #475569, transparent); // Stalowy zamiast czarnego
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

}

.armor-stats-bar {
  background: #475569; // Stalowy szary zamiast czarnego
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #64748b; // Jaśniejszy stalowy separator
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
      color: #94a3b8; // Stalowy szary zamiast brązowego
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
  flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  margin-top: auto; // Przykleja się do dołu karty
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
    flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
    display: flex;
    flex-direction: column;
    min-height: 0; // Usuwa minimalną wysokość
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
    margin-bottom: 0; // Usunięto margin-bottom, aby nie było pustej przestrzeni

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
    margin-top: 16px; // Zmieniono z auto na stały margin-top
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    position: relative;
    z-index: 10;

    &.no-content-above {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

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

// Accessory Card Styles - Gold theme
.accessory-header {
  background: #d4af37; // Złoty kolor
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  font-family: 'Epilogue', sans-serif;

  .accessory-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.3) 10px,
      rgba(255, 255, 255, 0.3) 12px
    );
  }

  .accessory-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .accessory-header-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .accessory-name {
    color: white;
    font-family: 'Epilogue', sans-serif !important;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
  }

  .accessory-header-icon {
    background: rgba(255, 255, 255, 0.2);
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

.accessory-illustration {
  flex: 1;
  min-height: 176px;
  width: 100%;
  background: #b8941f; // Ciemniejszy złoty
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #b8941f;
  z-index: 2;

  .accessory-image {
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

    .accessory-image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to top, #b8941f, transparent);
    }
  }

  .accessory-image-placeholder {
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

.accessory-body {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  margin-top: auto;
  min-height: 0;
  overflow: hidden;

  .accessory-body-bg-icon {
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

  .accessory-body-content {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .accessory-description {
    color: #111818;
    font-size: 14px;
    line-height: 1.625;
    font-weight: 500;
    margin-bottom: 0;

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

  .accessory-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    position: relative;
    z-index: 10;

    &.no-content-above {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .accessory-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .accessory-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .accessory-footer-cost {
      color: #1e293b;
    }

    .accessory-footer-rarity {
      color: #1e293b;
    }
  }
}

// Spell Card Styles - Red theme
.spell-header {
  background: #dc2626; // Czerwony kolor
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  font-family: 'Epilogue', sans-serif;

  .spell-header-diagonal {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.3) 10px,
      rgba(255, 255, 255, 0.3) 12px
    );
  }

  .spell-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .spell-header-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .spell-name {
    color: white;
    font-family: 'Epilogue', sans-serif !important;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 4px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 4px;

    .spell-offensive-icon {
      display: inline-flex;
      align-items: center;

      .material-symbols-outlined {
        font-size: 20px;
        color: #ffeb3b; // Żółty kolor błyskawicy
      }
    }
  }

  .spell-category {
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Epilogue', sans-serif !important;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .spell-header-icon {
    background: rgba(255, 255, 255, 0.2);
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

.spell-illustration {
  flex: 1;
  min-height: 176px;
  width: 100%;
  background: #b91c1c; // Ciemniejszy czerwony
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #b91c1c;
  z-index: 2;

  .spell-image {
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

    .spell-image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to top, #b91c1c, transparent);
    }
  }

  .spell-image-placeholder {
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

.spell-stats-bar {
  background: #b91c1c; // Ciemniejszy czerwony
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #dc2626;
  font-size: 11px;
  font-weight: 700;
  color: white;
  z-index: 2;
  min-width: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;

  .spell-stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-width: 0;

    .spell-stat-icon {
      font-size: 12px;
      color: #fca5a5; // Jaśniejszy czerwony dla ikon
      flex-shrink: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .spell-stat-text {
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex-shrink: 0;
      overflow: visible;
    }
  }

  .spell-stat-separator {
    width: 1px;
    height: 12px;
    background: #991b1b;
    flex-shrink: 0;
  }
}

.spell-body {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  margin-top: auto;
  min-height: 0;
  overflow: hidden;

  .spell-body-bg-icon {
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

  .spell-body-content {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .spell-description {
    color: #111818;
    font-size: 14px;
    line-height: 1.625;
    font-weight: 500;
    margin-bottom: 0;

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

  .spell-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    position: relative;
    z-index: 10;

    &.no-content-above {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .spell-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .spell-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .spell-footer-element {
      color: #1e293b;
    }
  }
}
</style>
