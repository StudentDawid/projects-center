<template>
  <v-app class="guild-app">
    <!-- Main Full-Height Layout -->
    <v-main class="main-layout">
      <div
        class="main-grid"
        :class="{
          'no-left': !showLeftSidebar,
          'no-right': !showRightSidebar,
        }"
      >
        <!-- Left Sidebar Navigation -->
        <nav v-show="showLeftSidebar" class="sidebar-left">
          <div class="sidebar-top">
            <div class="sidebar-header">
              <span class="sidebar-title">{{ t('sidebarTitle') }}</span>
              <v-btn
                icon
                variant="text"
                size="x-small"
                density="compact"
                :title="t('hideSidebar')"
                @click="showLeftSidebar = false"
              >
                <v-icon size="16">mdi-chevron-left</v-icon>
              </v-btn>
            </div>

            <ul class="sidebar-nav">
              <li v-for="item in navItems" :key="item.id">
                <a
                  href="#"
                  class="sidebar-link"
                  :class="{ 'sidebar-active': activeNav === item.id }"
                  @click.prevent="activeNav = item.id"
                >
                  <span class="d-flex align-center ga-3">
                    <span>{{ item.emoji }}</span>
                    <span>{{ t(item.labelKey) }}</span>
                  </span>
                  <span class="text-grey-lighten-1">&rsaquo;</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="sidebar-footer">
            <!-- Resources Status Header with toggle -->
            <button class="resources-toggle" @click="showResourcesStatus = !showResourcesStatus">
              <span class="sidebar-footer-title mb-0">{{ t('resources.title') }}</span>
              <v-icon size="14" class="toggle-icon" :class="{ 'rotated': !showResourcesStatus }">
                mdi-chevron-down
              </v-icon>
            </button>

            <!-- Collapsible Resources Section -->
            <Transition name="collapse">
              <div v-show="showResourcesStatus" class="resources-content">
                <div class="resource-list">
                  <div class="resource-item">
                    <div class="resource-header">
                      <span class="resource-label">
                        <span class="resource-emoji">&#x1FA99;</span> {{ t('resources.gold') }}
                      </span>
                      <span class="resource-values">
                        <span class="resource-amount text-amber-darken-2">{{ formatNumber(resources.gold) }}</span>
                        <span class="resource-max">/ {{ formatNumber(resources.goldMax) }}</span>
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="(resources.gold / resources.goldMax) * 100"
                      color="amber-darken-1"
                      height="4"
                      rounded
                      bg-color="grey-lighten-3"
                    />
                    <div class="resource-regen text-amber-darken-2">+{{ resources.goldIncome }}/m</div>
                  </div>

                  <div class="resource-item">
                    <div class="resource-header">
                      <span class="resource-label">
                        <span class="resource-emoji">&#x1FAB5;</span> {{ t('resources.wood') }}
                      </span>
                      <span class="resource-values">
                        <span class="resource-amount text-green-darken-2">{{ formatNumber(resources.wood) }}</span>
                        <span class="resource-max">/ {{ formatNumber(resources.woodMax) }}</span>
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="(resources.wood / resources.woodMax) * 100"
                      color="green-darken-1"
                      height="4"
                      rounded
                      bg-color="grey-lighten-3"
                    />
                  </div>

                  <div class="resource-item">
                    <div class="resource-header">
                      <span class="resource-label">
                        <span class="resource-emoji">&#x1FAA8;</span> {{ t('resources.stone') }}
                      </span>
                      <span class="resource-values">
                        <span class="resource-amount text-grey-darken-1">{{ formatNumber(resources.stone) }}</span>
                        <span class="resource-max">/ {{ formatNumber(resources.stoneMax) }}</span>
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="(resources.stone / resources.stoneMax) * 100"
                      color="grey"
                      height="4"
                      rounded
                      bg-color="grey-lighten-3"
                    />
                  </div>

                  <div class="resource-item">
                    <div class="resource-header">
                      <span class="resource-label">
                        <span class="resource-emoji">&#x2728;</span> {{ t('resources.mana') }}
                      </span>
                      <span class="resource-values">
                        <span class="resource-amount text-blue-darken-1">{{ resources.mana }}</span>
                        <span class="resource-max">/ {{ formatNumber(resources.manaMax) }}</span>
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="(resources.mana / resources.manaMax) * 100"
                      color="blue"
                      height="4"
                      rounded
                      bg-color="grey-lighten-3"
                    />
                    <div class="resource-regen text-blue-darken-1">+{{ resources.manaRegen }}/s</div>
                  </div>
                </div>

                <v-btn
                  color="blue-darken-1"
                  block
                  size="small"
                  class="mt-3 text-none font-weight-bold"
                  variant="flat"
                >
                  {{ t('resources.speedUp') }}
                </v-btn>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- Main Production Area -->
        <section class="production-center">
          <!-- Floating toggle buttons -->
          <div class="toggle-buttons">
            <v-btn
              v-if="!showLeftSidebar"
              icon
              variant="outlined"
              size="x-small"
              color="grey-darken-1"
              :title="t('showLeftSidebar')"
              @click="showLeftSidebar = true"
              class="toggle-btn"
            >
              <v-icon size="16">mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn
              v-if="!showRightSidebar"
              icon
              variant="outlined"
              size="x-small"
              color="grey-darken-1"
              :title="t('showRightSidebar')"
              @click="showRightSidebar = true"
              class="toggle-btn ml-auto"
            >
              <v-icon size="16">mdi-chevron-left</v-icon>
            </v-btn>
          </div>

          <!-- Grand Hall (default view) -->
          <div v-if="activeNav === 'grand-hall'" class="production-inner">
            <h2 class="production-title">{{ t('production.title') }}</h2>

            <!-- Recruitment Section -->
            <div class="section-block">
              <h3 class="section-label">{{ t('production.recruitment') }}</h3>

              <div class="recruit-box">
                <v-btn
                  color="blue-darken-1"
                  block
                  size="x-large"
                  class="recruit-btn text-none justify-space-between"
                  variant="flat"
                >
                  <span class="text-h6 font-weight-medium">{{ t('production.recruitNovices') }} ({{ units.novices }})</span>
                  <span class="text-h5 font-weight-light">&#x2335;</span>
                </v-btn>
                <div class="recruit-description">
                  {{ t('production.recruitDescription') }}
                  <br />
                  <span class="text-blue-darken-1 font-weight-bold" style="font-style: normal">
                    {{ t('production.currentBonus') }}
                  </span>
                </div>
              </div>

              <div class="action-card">
                <div>
                  <div class="action-title">{{ t('production.trainGuards') }}</div>
                  <div class="action-cost">{{ t('production.costGoldWood') }}</div>
                </div>
                <v-btn
                  variant="outlined"
                  color="blue-darken-1"
                  size="small"
                  class="action-btn text-none font-weight-bold"
                >
                  {{ t('production.train') }} ({{ units.guards }})
                </v-btn>
              </div>
            </div>

            <!-- Infrastructure Section -->
            <div class="section-block">
              <h3 class="section-label">{{ t('production.infrastructure') }}</h3>

              <div class="action-card">
                <div>
                  <div class="action-title">{{ t('production.expandDormitories') }} (Lvl {{ buildings.dormLevel }})</div>
                  <div class="action-cost mb-1">{{ t('production.dormitoriesDescription') }}</div>
                  <div class="action-resources">
                    <span class="text-red">{{ t('resources.stone') }}: {{ resources.stone }} / 1200</span>
                    <span class="text-green-darken-2">{{ t('resources.wood') }}: {{ formatNumber(resources.wood) }} / 800</span>
                  </div>
                </div>
                <v-btn
                  variant="flat"
                  color="grey-lighten-2"
                  size="small"
                  class="action-btn text-none font-weight-bold"
                  disabled
                >
                  {{ t('production.upgrade') }}
                </v-btn>
              </div>

              <div class="action-card">
                <div>
                  <div class="action-title">{{ t('production.arcaneLibrary') }}</div>
                  <div class="action-cost mb-1">{{ t('production.arcaneLibraryDescription') }}</div>
                  <div class="action-resources">
                    <span class="text-green-darken-2">{{ t('resources.gold') }}: 1.2K / 500</span>
                    <span class="text-red">{{ t('resources.mana') }}: {{ resources.mana }} / 2000</span>
                  </div>
                </div>
                <v-btn
                  variant="flat"
                  color="blue-darken-1"
                  size="small"
                  class="action-btn text-none font-weight-bold"
                >
                  {{ t('production.build') }}
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Profile view -->
          <div v-else-if="activeNav === 'profile'" class="production-inner">
            <h2 class="production-title">{{ t('profile.title') }}</h2>

            <div class="section-block">
              <h3 class="section-label">{{ t('profile.language') }}</h3>
              <p class="profile-description">{{ t('profile.languageDescription') }}</p>

              <div class="language-selector">
                <button
                  class="language-option"
                  :class="{ 'language-active': locale === 'en' }"
                  @click="setLocale('en')"
                >
                  <span class="language-flag">🇬🇧</span>
                  <span class="language-name">{{ t('profile.english') }}</span>
                  <v-icon v-if="locale === 'en'" size="16" color="blue-darken-1" class="ml-auto">
                    mdi-check-circle
                  </v-icon>
                </button>
                <button
                  class="language-option"
                  :class="{ 'language-active': locale === 'pl' }"
                  @click="setLocale('pl')"
                >
                  <span class="language-flag">🇵🇱</span>
                  <span class="language-name">{{ t('profile.polish') }}</span>
                  <v-icon v-if="locale === 'pl'" size="16" color="blue-darken-1" class="ml-auto">
                    mdi-check-circle
                  </v-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Placeholder for other views -->
          <div v-else class="production-inner">
            <h2 class="production-title">{{ t(`nav.${activeNav === 'grand-hall' ? 'grandHall' : activeNav}`) }}</h2>
            <div class="placeholder-content">
              <v-icon size="64" color="grey-lighten-1">mdi-hammer-wrench</v-icon>
              <p class="text-grey text-body-2 mt-4">Coming soon...</p>
            </div>
          </div>
        </section>

        <!-- Right Sidebar (Quests & Logs) -->
        <aside v-show="showRightSidebar" class="sidebar-right">
          <div class="sidebar-right-header">
            <v-btn
              icon
              variant="text"
              size="x-small"
              density="compact"
              :title="t('hideSidebar')"
              @click="showRightSidebar = false"
            >
              <v-icon size="16">mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- Active Quests -->
          <div class="quests-panel">
            <div class="panel-header">
              <span class="text-h6">&#x2694;&#xFE0F;</span>
              <h3 class="panel-title">{{ t('quests.activeQuests') }}</h3>
            </div>

            <div class="quests-list">
              <div v-for="quest in activeQuests" :key="quest.id" class="quest-item">
                <div class="quest-header">
                  <span class="quest-name">{{ t(quest.nameKey) }}</span>
                  <span class="quest-percent text-blue-darken-1">{{ quest.progress }}%</span>
                </div>
                <v-progress-linear
                  :model-value="quest.progress"
                  color="blue"
                  height="8"
                  rounded
                  bg-color="grey-lighten-3"
                  class="mb-1"
                />
                <div class="quest-eta">ETA: {{ quest.eta }}</div>
              </div>
            </div>

            <div class="contracts-section">
              <h4 class="contracts-title">{{ t('quests.availableContracts') }}</h4>
              <div
                v-for="contract in availableContracts"
                :key="contract.id"
                class="contract-item"
              >
                + {{ t(contract.nameKey) }} ({{ t('quests.reqGuards', { count: contract.guardCount }) }})
              </div>
            </div>
          </div>

          <!-- Guild Log -->
          <div class="guild-log">
            <div class="panel-header">
              <span class="text-h6">&#x1F514;</span>
              <h3 class="panel-title">{{ t('log.title') }}</h3>
            </div>
            <div class="log-entries">
              <div v-for="entry in guildLogEntries" :key="entry.id" class="log-entry">
                <span class="log-time">{{ entry.time }}</span>
                <span class="log-message" v-html="entry.message" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';

const { t, locale, setLocale } = useI18n();

// Sidebar visibility
const showLeftSidebar = ref(true);
const showRightSidebar = ref(true);
const showResourcesStatus = ref(true);

// Navigation
const activeNav = ref('grand-hall');

const navItems = [
  { id: 'grand-hall', emoji: '🏛️', labelKey: 'nav.grandHall' },
  { id: 'tavern', emoji: '🍺', labelKey: 'nav.tavern' },
  { id: 'quests', emoji: '⚔️', labelKey: 'nav.quests' },
  { id: 'research', emoji: '📜', labelKey: 'nav.research' },
  { id: 'market', emoji: '⚖️', labelKey: 'nav.market' },
  { id: 'profile', emoji: '👤', labelKey: 'nav.profile' },
];

// Resources
const resources = reactive({
  gold: 12400,
  goldMax: 50000,
  wood: 4200,
  woodMax: 10000,
  stone: 2100,
  stoneMax: 10000,
  mana: 850,
  manaMax: 2200,
  manaRegen: 12,
  goldIncome: 45,
});

// Units
const units = reactive({
  novices: 24,
  guards: 12,
});

// Buildings
const buildings = reactive({
  dormLevel: 4,
});

// Quests
const activeQuests = [
  { id: 1, nameKey: 'quests.clearDarkForest', progress: 72, eta: '02m 45s' },
  { id: 2, nameKey: 'quests.merchantEscort', progress: 15, eta: '12m 10s' },
];

const availableContracts = [
  { id: 1, nameKey: 'quests.scoutMountainPass', guardCount: 2 },
];

// Guild Log (computed so it reacts to locale changes)
const guildLogEntries = computed(() => [
  { id: 1, time: '12:04', message: t('log.welcomeBack') },
  { id: 2, time: '12:05', message: t('log.novicesCompleted', { count: 5 }) },
  { id: 3, time: '12:08', message: t('log.vaultCapacity', { percent: 90 }) },
  { id: 4, time: '12:10', message: t('log.questReward', { quest: 'Spider Hunt', reward: 400 }) },
]);

// Helpers
function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
</script>

<style lang="scss" scoped>
// ============================================
// Layout
// ============================================
.guild-app {
  background: #ffffff;
  color: #1e293b;
  font-family: system-ui, -apple-system, sans-serif;
}

.main-layout {
  height: 100%;
}

.main-grid {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  height: 100vh;
  transition: grid-template-columns 0.25s ease;

  &.no-left {
    grid-template-columns: 0px 1fr 320px;
  }

  &.no-right {
    grid-template-columns: 240px 1fr 0px;
  }

  &.no-left.no-right {
    grid-template-columns: 0px 1fr 0px;
  }
}

// ============================================
// Left Sidebar
// ============================================
.sidebar-left {
  grid-column: 1;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}

.sidebar-top {
  flex: 1;
  padding-top: 8px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 16px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  letter-spacing: -0.01em;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &.sidebar-active {
    background-color: #f3f4f6;
    border-right: 4px solid #1e88e5;
    color: #1e88e5;
    font-weight: 600;
  }
}

.sidebar-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #f3f4f6;
}

// Resources toggle button
.resources-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0 8px;

  &:hover {
    .sidebar-footer-title {
      color: #6b7280;
    }
  }
}

.sidebar-footer-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  font-weight: 700;
  transition: color 0.15s ease;
}

.toggle-icon {
  color: #9ca3af;
  transition: transform 0.25s ease;

  &.rotated {
    transform: rotate(-90deg);
  }
}

// Resources collapsible content
.resources-content {
  overflow: hidden;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  max-height: 400px;
  opacity: 1;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

// Resource items
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.resource-label {
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-emoji {
  font-size: 12px;
}

.resource-values {
  font-family: monospace;
  font-size: 11px;
}

.resource-amount {
  font-weight: 700;
}

.resource-max {
  color: #9ca3af;
  font-weight: 400;
}

.resource-regen {
  font-size: 10px;
  font-family: monospace;
  text-align: right;
  margin-top: -1px;
}

// ============================================
// Production Center
// ============================================
.production-center {
  grid-column: 2;
  padding: 32px;
  overflow-y: auto;
  background-color: rgba(248, 250, 252, 0.3);
  position: relative;
}

.toggle-buttons {
  display: flex;
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 5;
  pointer-events: none;

  .toggle-btn {
    pointer-events: auto;
  }
}

.production-inner {
  max-width: 768px;
  margin: 0 auto;
}

.production-title {
  font-size: 24px;
  font-weight: 300;
  color: #374151;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.section-block {
  margin-bottom: 40px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

// Recruit box
.recruit-box {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 24px;
}

.recruit-btn {
  width: 100%;
}

.recruit-description {
  padding: 16px;
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
}

// Action cards
.action-card {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s ease;
  margin-bottom: 16px;

  &:hover {
    border-color: #93c5fd;
  }
}

.action-title {
  font-weight: 700;
  color: #374151;
  font-size: 14px;
}

.action-cost {
  font-size: 12px;
  color: #9ca3af;
}

.action-resources {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 10px;
}

.action-btn {
  min-width: 100px;
}

// ============================================
// Profile
// ============================================
.profile-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}

.language-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  text-align: left;

  &:hover {
    border-color: #93c5fd;
    background-color: #f8fafc;
  }

  &.language-active {
    border-color: #1e88e5;
    background-color: #eff6ff;
  }
}

.language-flag {
  font-size: 22px;
  line-height: 1;
}

.language-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

// Placeholder for unbuilt views
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

// ============================================
// Right Sidebar
// ============================================
.sidebar-right {
  grid-column: 3;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  overflow-x: hidden;
  min-width: 0;
}

.sidebar-right-header {
  display: flex;
  justify-content: flex-start;
  padding: 8px 12px 0;
}

.quests-panel {
  padding: 16px 24px 24px;
  flex: 1;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
}

.quests-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.quest-name {
  color: #374151;
}

.quest-percent {
  font-family: monospace;
}

.quest-eta {
  font-size: 10px;
  color: #9ca3af;
}

// Contracts
.contracts-section {
  margin-top: 40px;
}

.contracts-title {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.contract-item {
  padding: 8px;
  border: 1px dashed #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-bottom: 8px;

  &:hover {
    background-color: #f9fafb;
  }
}

// Guild Log
.guild-log {
  height: 33%;
  border-top: 1px solid #e5e7eb;
  padding: 24px;
  background-color: rgba(248, 250, 252, 1);
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 128px;
  padding-right: 8px;
  font-size: 11px;
  line-height: 1.6;
}

.log-entry {
  display: flex;
  gap: 8px;
}

.log-time {
  color: #9ca3af;
  flex-shrink: 0;
  font-family: monospace;
  font-size: 11px;
}

.log-message {
  color: #4b5563;
}
</style>
