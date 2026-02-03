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
        'card-item':
          card.type === CardTypeEnum.ITEM,
        'card-skill':
          card.type === CardTypeEnum.SKILL,
        'card-quest':
          card.type === CardTypeEnum.QUEST,
        'card-location':
          card.type === CardTypeEnum.LOCATION,
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
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">swords</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">swords</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="card-stats-bar">
          <div v-if="getStatRequirements(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined"
              >target</span
            >
            <span class="card-stat-text">{{
              getStatRequirements(card)
            }}</span>
          </div>
          <div
            v-if="getStatRequirements(card) || getWeaponDamage(card)"
            class="card-stat-separator"
          />
          <div v-if="getWeaponDamage(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined"
              >sword_rose</span
            >
            <span class="card-stat-text">{{ getWeaponDamage(card) }}</span>
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
            class="card-stat-separator"
          />
          <div
            v-if="getWeaponHands(card)"
            class="card-stat-item card-stat-item-right"
          >
            <span class="card-stat-icon material-symbols-outlined">{{
              getWeaponHandsIcon(card)
            }}</span>
            <span class="card-stat-text">{{ getWeaponHands(card) }}</span>
          </div>
        </div>

        <!-- Body Content -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">swords</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="card-footer-cost"
                >Koszt: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="card-footer-cost"
                >Koszt: {{ card.sellValue }} ZNT</span
              >
              <span class="card-footer-rarity">{{
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
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">shield</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">shield</span>
          </div>
          </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="card-stats-bar">
          <div v-if="getArmorDefense(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">shield</span>
            <span class="card-stat-text">Pancerz {{ getArmorDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorDefense(card) && getArmorMagicDefense(card)"
            class="card-stat-separator"
          />
          <div v-if="getArmorMagicDefense(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">auto_awesome</span>
            <span class="card-stat-text">M. Pancerz {{ getArmorMagicDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorMagicDefense(card)"
            class="card-stat-separator"
          />
          <div class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">visibility</span>
            <span class="card-stat-text">{{ getArmorInitiative(card) || '-' }}</span>
          </div>
          <div
            v-if="getArmorMight(card)"
            class="card-stat-separator"
          />
          <div v-if="getArmorMight(card)" class="card-stat-item card-stat-item-right">
            <span class="card-stat-icon material-symbols-outlined">lock</span>
            <span class="card-stat-text">{{ getArmorMight(card) }}</span>
          </div>
          </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">shield</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="card-footer-cost"
                >Koszt: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="card-footer-cost"
                >Koszt: {{ card.sellValue }} ZNT</span
              >
              <span class="card-footer-rarity">{{
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
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">shield</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">shield</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'stats' in card && card.stats" class="card-stats-bar">
          <div v-if="getArmorDefense(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">shield</span>
            <span class="card-stat-text">Pancerz +{{ getShieldDefense(card) }}</span>
          </div>
          <div
            v-if="getArmorDefense(card) && getArmorMagicDefense(card)"
            class="card-stat-separator"
          />
          <div v-if="getArmorMagicDefense(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">auto_awesome</span>
            <span class="card-stat-text">M. Pancerz +{{ getShieldMagicDefense(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">shield</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="card-footer-cost"
                >Koszt: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="card-footer-cost"
                >Koszt: {{ card.sellValue }} ZNT</span
              >
              <span class="card-footer-rarity">{{
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
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">diamond</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">diamond</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">diamond</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span
                v-if="'buyValue' in card && card.buyValue"
                class="card-footer-cost"
                >Koszt: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="card-footer-cost"
                >Koszt: {{ card.sellValue }} ZNT</span
              >
              <span class="card-footer-rarity">{{
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
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">
                {{ card.name.toUpperCase() }}
                <span v-if="(card as any).isOffensive" class="card-offensive-icon">
                  <span class="material-symbols-outlined">bolt</span>
                </span>
              </h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">auto_fix</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">auto_fix</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="'mpCost' in card || 'target' in card || 'duration' in card" class="card-stats-bar">
          <div v-if="getSpellMpCost(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">magic_button</span>
            <span class="card-stat-text">{{ getSpellMpCost(card) }} PM</span>
          </div>
          <div
            v-if="getSpellMpCost(card) && getSpellTarget(card)"
            class="card-stat-separator"
          />
          <div v-if="getSpellTarget(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">target</span>
            <span class="card-stat-text">{{ getSpellTarget(card) }}</span>
          </div>
          <div
            v-if="getSpellTarget(card) && getSpellDuration(card)"
            class="card-stat-separator"
          />
          <div v-if="getSpellDuration(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">schedule</span>
            <span class="card-stat-text">{{ getSpellDuration(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">auto_fix</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span v-if="getSpellElement(card)" class="card-footer-element">
                ELEMENT: {{ getSpellElement(card) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Item Card Design -->
      <template
        v-else-if="card.type === CardTypeEnum.ITEM"
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="getItemTarget(card) || getItemUsage(card)" class="card-stats-bar">
          <div v-if="getItemTarget(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">target</span>
            <span class="card-stat-text">{{ getItemTarget(card) }}</span>
          </div>
          <div
            v-if="getItemTarget(card) && getItemUsage(card)"
            class="card-stat-separator"
          />
          <div v-if="getItemUsage(card)" class="card-stat-item">
            <span class="card-stat-icon material-symbols-outlined">schedule</span>
            <span class="card-stat-text">{{ getItemUsage(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>

            <!-- Uses section -->
            <div v-if="getItemUses(card) > 0" class="item-uses-section">
              <span class="item-uses-label">UŻYCIA:</span>
              <div class="item-uses-circles">
                <span
                  v-for="i in getItemUses(card)"
                  :key="i"
                  class="item-use-circle"
                ></span>
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <!-- Cost in footer -->
              <span
                v-if="getItemFpCost(card)"
                class="card-footer-cost"
                >Koszt: {{ getItemFpCost(card) }} PE</span
              >
              <span
                v-else-if="'buyValue' in card && card.buyValue"
                class="card-footer-cost"
                >Koszt: {{ card.buyValue }} ZNT</span
              >
              <span
                v-else-if="'sellValue' in card && card.sellValue"
                class="card-footer-cost"
                >Koszt: {{ card.sellValue }} ZNT</span
              >
              <span class="card-footer-rarity">{{
                getRarityLabel(card.rarity).toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Skill Card Design -->
      <template
        v-else-if="card.type === CardTypeEnum.SKILL"
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
              <p v-if="getSkillCategory(card)" class="card-category">{{ getSkillCategory(card).toUpperCase() }}</p>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">star</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">star</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">star</span>
          </div>
          <div class="card-body-content">
            <!-- Description -->
            <div v-if="card.description && card.description.trim()" class="card-description">
              <p v-html="formatDescription(card.description)" />
            </div>

            <!-- Tags -->
            <div v-if="card.tags && card.tags.length > 0" class="skill-tags">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="skill-tag"
              >{{ tag.toUpperCase() }}</span>
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span v-if="getSkillMaxLevel(card)" class="card-footer-max-level">
                Maksymalny poziom: {{ getSkillMaxLevel(card) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Quest Card Design -->
      <template
        v-else-if="card.type === CardTypeEnum.QUEST"
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">task_alt</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
            <div class="card-image-gradient" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
        </div>

        <!-- Location and Time Section -->
        <div v-if="getQuestLocation(card) || getQuestTimeLimit(card)" class="quest-location-time">
          <div v-if="getQuestLocation(card)" class="quest-location">
            <span class="material-symbols-outlined">place</span>
            <span>{{ getQuestLocation(card) }}</span>
          </div>
          <div
            v-if="getQuestLocation(card) && getQuestTimeLimit(card)"
            class="quest-separator"
          ></div>
          <div v-if="getQuestTimeLimit(card)" class="quest-time">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ getQuestTimeLimit(card) }}</span>
          </div>
        </div>

        <!-- Properties Section -->
        <div class="card-body">
          <div class="card-body-bg-icon">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="card-body-content">
            <!-- Objectives Section -->
            <div v-if="card.description && card.description.trim()" class="quest-objectives">
              <div class="quest-description">
                <p v-html="formatDescription(card.description)" />
              </div>
            </div>

            <!-- Rewards Section -->
            <div v-if="getQuestRewards(card) && getQuestRewards(card)!.length > 0" class="quest-rewards">
              <span class="quest-section-label">NAGRODY:</span>
              <div class="quest-rewards-list">
                <div
                  v-for="reward in getQuestRewards(card)"
                  :key="reward"
                  class="quest-reward-badge"
                >
                  <span class="quest-reward-icon material-symbols-outlined">
                    {{ getRewardIcon(reward) }}
                  </span>
                  <span class="quest-reward-text">{{ reward.toUpperCase() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div
            class="card-footer"
            :class="{ 'no-content-above': !card.description || (card.description && card.description.trim() === '') }"
          >
            <p v-if="getCardFlavor(card)" class="card-flavor">
              {{ getCardFlavor(card) }}
            </p>
            <div class="card-footer-info">
              <span v-if="getQuestRank(card)" class="card-footer-rank">
                RANGA: {{ getQuestRank(card) }}
              </span>
              <span v-if="getQuestClient(card)" class="card-footer-client">
                KLIENT: {{ getQuestClient(card) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Location Card Design -->
      <template
        v-else-if="card.type === CardTypeEnum.LOCATION"
      >
        <!-- Header with diagonal stripes -->
        <div v-if="card.name && card.name.trim()" class="card-header">
          <div class="card-header-diagonal" />
          <div class="card-header-content">
            <div class="card-header-text">
              <h2 class="card-name">{{ card.name.toUpperCase() }}</h2>
            </div>
            <div class="card-header-icon">
              <span class="material-symbols-outlined">place</span>
            </div>
          </div>
        </div>

        <!-- Illustration Area -->
        <div class="card-illustration">
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.name" />
          </div>
          <div v-else class="card-image-placeholder">
            <span class="material-symbols-outlined">place</span>
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
} from '@libs/entities/card';
import {
  CardType as CardTypeEnum,
  Rarity as RarityEnum,
  DamageType as DamageTypeEnum,
  AccuracyStat as AccuracyStatEnum,
  WeaponType as WeaponTypeEnum,
} from '@libs/entities/card';

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
    return 'SPELL';
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

// Item helper functions
function getItemType(card: Card): string {
  if (card.type === CardTypeEnum.ITEM) {
    if ((card as any).consumable) {
      return 'PRZEDMIOT JEDNORAZOWY';
    }
    return 'PRZEDMIOT';
  }
  return '';
}

function getItemCost(card: Card): string | null {
  if (card.type === CardTypeEnum.ITEM) {
    const fpCost = (card as any).fpCost;
    if (fpCost !== undefined && fpCost !== null && fpCost > 0) {
      return `${fpCost} PE`;
    }
    const buyValue = (card as any).buyValue;
    if (buyValue !== undefined && buyValue !== null && buyValue > 0) {
      return `${buyValue} ZNT`;
    }
  }
  return null;
}

function getItemFpCost(card: Card): number | null {
  if (card.type === CardTypeEnum.ITEM) {
    const fpCost = (card as any).fpCost;
    if (fpCost !== undefined && fpCost !== null && fpCost > 0) {
      return fpCost;
    }
  }
  return null;
}

function getItemTarget(card: Card): string | null {
  if (card.type === CardTypeEnum.ITEM && 'target' in card) {
    const target = (card as any).target;
    const labels: Record<string, string> = {
      self: 'Ty',
      single: 'Jedna istota',
      three: 'Do trzech istot',
      special: 'Specjalne',
    };
    return labels[target] || null;
  }
  return null;
}

function getItemUsage(card: Card): string | null {
  if (card.type === CardTypeEnum.ITEM && 'usageType' in card) {
    const usageType = (card as any).usageType;
    if (usageType === 'see_below') {
      return null; // Don't show if "see below"
    }
    const labels: Record<string, string> = {
      single_use: 'Jednorazowe',
      permanent: 'Trwałe',
    };
    return labels[usageType] || null;
  }
  return null;
}

function getItemUses(card: Card): number {
  if (card.type === CardTypeEnum.ITEM && 'uses' in card) {
    const uses = (card as any).uses;
    if (uses !== undefined && uses !== null && uses >= 1 && uses <= 5) {
      return uses;
    }
  }
  return 0;
}

// Skill helper functions
function getSkillCategory(card: Card): string | null {
  if (card.type === CardTypeEnum.SKILL && 'category' in card) {
    const category = (card as any).category;
    if (category && category.trim()) {
      return category;
    }
  }
  return null;
}

function getSkillMpCost(card: Card): string | null {
  if (card.type === CardTypeEnum.SKILL && 'mpCost' in card) {
    const mpCost = (card as any).mpCost;
    if (mpCost !== undefined && mpCost !== null && mpCost > 0) {
      return `${mpCost} MP`;
    }
  }
  return null;
}

function getSkillTarget(card: Card): string | null {
  if (card.type === CardTypeEnum.SKILL && 'target' in card) {
    const target = (card as any).target;
    const labels: Record<string, string> = {
      self: 'Self',
      single: 'Single Target',
      three: 'Up to 3 Allies',
      all: 'All Allies',
      special: 'Special',
    };
    return labels[target] || null;
  }
  return null;
}

function getSkillDuration(card: Card): string | null {
  if (card.type === CardTypeEnum.SKILL && 'duration' in card) {
    const duration = (card as any).duration;
    const labels: Record<string, string> = {
      instant: 'Instant',
      scene: 'Scene',
      turn: 'Turn',
    };
    return labels[duration] || null;
  }
  return null;
}

function getSkillMaxLevel(card: Card): number | null {
  if (card.type === CardTypeEnum.SKILL && 'maxLevel' in card) {
    const maxLevel = (card as any).maxLevel;
    if (maxLevel !== undefined && maxLevel !== null && maxLevel > 1) {
      return maxLevel;
    }
  }
  return null;
}

// Quest helper functions
function getQuestType(card: Card): string | null {
  if (card.type === CardTypeEnum.QUEST) {
    if ((card as any).isMainQuest) {
      return 'HEROIC QUEST';
    }
    return 'SIDE QUEST';
  }
  return null;
}

function getQuestLocation(card: Card): string | null {
  if (card.type === CardTypeEnum.QUEST && 'location' in card) {
    const location = (card as any).location;
    if (location && location.trim()) {
      return location;
    }
  }
  return null;
}

function getQuestRewards(card: Card): string[] | null {
  if (card.type === CardTypeEnum.QUEST && 'rewards' in card) {
    const rewards = (card as any).rewards;
    if (rewards && Array.isArray(rewards) && rewards.length > 0) {
      return rewards;
    }
  }
  return null;
}

function getQuestRank(card: Card): string | null {
  if (card.type === CardTypeEnum.QUEST && 'rank' in card) {
    const rank = (card as any).rank;
    if (rank && rank !== '-') {
      return rank;
    }
  }
  return null;
}

function getQuestClient(card: Card): string | null {
  if (card.type === CardTypeEnum.QUEST && 'client' in card) {
    const client = (card as any).client;
    if (client && client.trim()) {
      return client;
    }
  }
  return null;
}

function getQuestTimeLimit(card: Card): string | null {
  if (card.type === CardTypeEnum.QUEST && 'timeLimit' in card) {
    const timeLimit = (card as any).timeLimit;
    if (timeLimit !== undefined && timeLimit !== null && timeLimit > 0) {
      return `${timeLimit} ${timeLimit === 1 ? 'Dzień' : 'Dni'}`;
    }
  }
  return null;
}

function getRewardIcon(reward: string): string {
  // Try to detect reward type and return appropriate icon
  const lowerReward = reward.toLowerCase();
  if (lowerReward.includes('zenit') || lowerReward.includes('znt') || lowerReward.includes('$') || lowerReward.match(/\d+\s*(zenit|znt)/i)) {
    return 'attach_money';
  }
  if (lowerReward.includes('material') || lowerReward.includes('materiał')) {
    return 'diamond';
  }
  if (lowerReward.includes('exp') || lowerReward.includes('doświadczenie')) {
    return 'star';
  }
  // Default icon
  return 'inventory_2';
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
      return `+${initiative} Inicjatywa`;
    } else if (initiative < 0) {
      return `${initiative} Inicjatywa`;
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

  &.card-item {
    border-color: #f59e0b; // Pomarańczowy kolor obramowania dla karty przedmiotu
  }

  &.card-quest {
    border-color: #7c3aed; // Purple color for quest card
  }

  &.card-location {
    border-color: #3b82f6; // Blue color for location card
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

// Unified Card Header - Base styles for all card types
.card-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  font-family: 'Epilogue', sans-serif;

  .card-header-diagonal {
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

  .card-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .card-header-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .card-name {
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

  .card-category {
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Epilogue', sans-serif !important;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .card-header-icon {
    background: rgba(255, 255, 255, 0.15);
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

  // Type-specific color modifiers
  .card-weapon &,
  .card-inner.card-weapon & {
    background: #8b6d4c;

    .card-header-diagonal {
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 200, 150, 0.4) 10px,
        rgba(255, 200, 150, 0.4) 12px
      );
    }
  }

  .card-armor &,
  .card-inner.card-armor &,
  .card-shield &,
  .card-inner.card-shield & {
    background: #64748b;
  }

  .card-accessory &,
  .card-inner.card-accessory & {
    background: #d4af37;
  }

  .card-spell &,
  .card-inner.card-spell & {
    background: #dc2626;
  }

  .card-item &,
  .card-inner.card-item & {
    background: #f59e0b;
  }

  .card-skill &,
  .card-inner.card-skill & {
    background: #0f766e; // Teal/dark green color
  }

  .card-quest &,
  .card-inner.card-quest & {
    background: #7c3aed; // Purple color for quest card

    .card-header-diagonal {
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.3) 10px,
        rgba(255, 255, 255, 0.3) 12px
      );
    }
  }

  .card-location &,
  .card-inner.card-location & {
    background: #3b82f6; // Blue color for location card

    .card-header-diagonal {
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.3) 10px,
        rgba(255, 255, 255, 0.3) 12px
      );
    }
  }
}

// Note: Old header styles for other card types removed - now using unified .card-header above

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

// Unified Card Illustration - Base styles for all card types
.card-illustration {
  flex: 1; // Rozciąga się, aby wypełnić dostępną przestrzeń
  min-height: 176px; // Minimalna wysokość, ale może się rozciągać
  width: 100%;
  position: relative;
  overflow: hidden;
  z-index: 2;
  // Default colors - will be overridden by type-specific modifiers
  background: #6b5a4a;

  .card-image {
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

    .card-image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      // Default gradient color - will be overridden by type-specific modifiers
      background: linear-gradient(to top, #6b5a4a, transparent);
    }
  }

  .card-image-placeholder {
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

  // Type-specific gradient colors
  .card-weapon &,
  .card-inner.card-weapon & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #6b5a4a, transparent);
    }
  }

  .card-armor &,
  .card-inner.card-armor &,
  .card-shield &,
  .card-inner.card-shield & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #475569, transparent);
    }
  }

  .card-accessory &,
  .card-inner.card-accessory & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #b8941f, transparent);
    }
  }

  .card-spell &,
  .card-inner.card-spell & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #b91c1c, transparent);
    }
  }

  .card-item &,
  .card-inner.card-item & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #d97706, transparent);
    }
  }

  .card-skill &,
  .card-inner.card-skill & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #0f766e, transparent);
    }
  }

  .card-quest &,
  .card-inner.card-quest & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #6d28d9, transparent);
    }
  }

  .card-location &,
  .card-inner.card-location & {
    .card-image .card-image-gradient {
      background: linear-gradient(to top, #2563eb, transparent);
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

// Unified Card Stats Bar - Base styles for all card types
.card-stats-bar {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  z-index: 2;
  min-width: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  // Default background - will be overridden by type-specific modifiers
  background: #6b5a4a;
  border-bottom: 1px solid #8b6d4c;

  .card-stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-width: 0;

    &.card-stat-item-right {
      margin-left: auto;
      color: #d1d5db;
      flex-shrink: 0;
    }

    .card-stat-icon {
      font-size: 12px;
      flex-shrink: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      // Default color - will be overridden by type-specific modifiers
      color: #f4d5a6;
    }

    .card-stat-text {
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex-shrink: 0;
      overflow: visible;
    }

    .weapon-damage-type-icon {
      font-size: 12px;
      flex-shrink: 0;
      margin-left: 2px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      filter: brightness(1.2);
    }
  }

  .card-stat-separator {
    width: 1px;
    height: 12px;
    flex-shrink: 0;
    // Default color - will be overridden by type-specific modifiers
    background: #4b5563;
  }

  // Type-specific color modifiers
  .card-weapon &,
  .card-inner.card-weapon & {
    background: #6b5a4a;
    border-bottom: 1px solid #8b6d4c;

    .card-stat-item .card-stat-icon {
      color: #f4d5a6;
    }

    .card-stat-separator {
      background: #4b5563;
    }
  }

  .card-armor &,
  .card-inner.card-armor &,
  .card-shield &,
  .card-inner.card-shield & {
    background: #475569;
    border-bottom: 1px solid #64748b;

    .card-stat-item .card-stat-icon {
      color: #94a3b8;
    }

    .card-stat-separator {
      background: #4b5563;
    }
  }

  .card-accessory &,
  .card-inner.card-accessory & {
    background: #b8941f;
    border-bottom: 1px solid #d4af37;

    .card-stat-item .card-stat-icon {
      color: #f4d03f;
    }

    .card-stat-separator {
      background: #991b1b;
    }
  }

  .card-spell &,
  .card-inner.card-spell & {
    background: #b91c1c;
    border-bottom: 1px solid #dc2626;

    .card-stat-item .card-stat-icon {
      color: #fca5a5;
    }

    .card-stat-separator {
      background: #991b1b;
    }
  }

  .card-item &,
  .card-inner.card-item & {
    background: #d97706;
    border-bottom: 1px solid #f59e0b;

    .card-stat-item .card-stat-icon {
      color: #fef3c7;
    }

    .card-stat-separator {
      background: #92400e;
    }
  }

  .card-skill &,
  .card-inner.card-skill & {
    background: #0f766e;
    border-bottom: 1px solid #14b8a6;

    .card-stat-item .card-stat-icon {
      color: #5eead4;
    }

    .card-stat-separator {
      background: #134e4a;
    }
  }

  .card-quest &,
  .card-inner.card-quest & {
    background: #6d28d9;
    border-bottom: 1px solid #8b5cf6;

    .card-stat-item .card-stat-icon {
      color: #c4b5fd;
    }

    .card-stat-separator {
      background: #5b21b6;
    }
  }

  .card-location &,
  .card-inner.card-location & {
    background: #2563eb;
    border-bottom: 1px solid #3b82f6;

    .card-stat-item .card-stat-icon {
      color: #93c5fd;
    }

    .card-stat-separator {
      background: #1e40af;
    }
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
.card-body {
  flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
  display: flex;
  flex-direction: column;
  background: white;
  padding: 16px;
  position: relative;
  min-height: 0;
  overflow: hidden;
  margin-top: auto; // Przykleja się do dołu karty

  .card-body-bg-icon {
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

  .card-body-content {
    position: relative;
    z-index: 10;
    flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
    display: flex;
    flex-direction: column;
    min-height: 0; // Usuwa minimalną wysokość
  }

  .card-description {
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

  .card-footer {
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

    .card-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .card-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .card-footer-cost {
      color: #9ca3af;
    }

    .card-footer-rarity {
      color: #9ca3af;
    }
  }
}

// Item uses section (moved outside footer, inside body content)
.item-uses-section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  margin-bottom: 0;

  .item-uses-label {
    font-size: 9px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .item-uses-circles {
    display: flex;
    gap: 4px;
    align-items: center;

    .item-use-circle {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #f59e0b;
      background: transparent;
      flex-shrink: 0;
    }
  }
}

// Quest specific styles
.quest-location-time {
  background: #1f2937;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 10px;
  font-weight: 500;

  .quest-location,
  .quest-time {
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
      font-size: 14px;
      color: #a78bfa;
    }
  }

  .quest-separator {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.3);
  }
}

.quest-objectives {
  margin-bottom: 12px;

  .quest-section-label {
    display: block;
    font-size: 9px;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .quest-description {
    p {
      color: #374151;
      font-size: 10px;
      line-height: 1.4;
      margin: 0;
    }
  }
}

.quest-rewards {
  margin-top: 12px;
  margin-bottom: 0;

  .quest-section-label {
    display: block;
    font-size: 9px;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .quest-rewards-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .quest-reward-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: #ede9fe;
      border-radius: 4px;
      font-size: 9px;
      color: #7c3aed;
      font-weight: 600;

      .quest-reward-icon {
        font-size: 14px;
        color: #7c3aed;
      }

      .quest-reward-text {
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  }
}

// Quest footer styles
.card-footer-rank {
  color: #9ca3af;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.card-footer-client {
  color: #9ca3af;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: auto;
}

// Quest card body background
.card-quest .card-body,
.card-inner.card-quest .card-body {
  background: #f9fafb; // Light off-white background
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

  .card-image {
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

  }

  .card-image-placeholder {
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

.card-body {
  flex: 0 0 auto; // Dostosowuje się do zawartości, nie rozciąga się
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  margin-top: auto; // Przykleja się do dołu karty
  min-height: 0;
  overflow: hidden;

  .card-body-bg-icon {
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

  .card-body-content {
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

  .card-description {
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

  .card-footer {
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

    .card-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .card-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .card-footer-cost {
      color: #1e293b;
    }

    .card-footer-rarity {
      color: #1e293b;
    }
  }
}

.card-body {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
    margin-top: auto;
  min-height: 0;
  overflow: hidden;

  .card-body-bg-icon {
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

  .card-body-content {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .card-description {
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

  .card-footer {
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

    .card-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .card-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .card-footer-cost {
      color: #1e293b;
    }

    .card-footer-rarity {
      color: #1e293b;
    }
  }
}

  .card-image {
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

  }

  .card-image-placeholder {
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

.card-body {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  margin-top: auto;
  min-height: 0;
  overflow: hidden;

  .card-body-bg-icon {
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

  .card-body-content {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .card-description {
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

  .card-footer {
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

    .card-flavor {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.4;
      font-family: serif;
      margin-bottom: 8px;
    }

    .card-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .card-footer-element {
      color: #1e293b;
    }
  }
}
</style>
