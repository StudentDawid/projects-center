<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('profile.title') }}</h2>

    <!-- Theme section -->
    <div class="section-block">
      <h3 class="section-label">{{ t('profile.theme') }}</h3>
      <p class="profile-description">{{ t('profile.themeDescription') }}</p>

      <div class="theme-selector">
        <button class="theme-option" :class="{ 'option-active': theme === 'light' }" @click="setTheme('light')">
          <div class="theme-preview theme-preview-light">
            <v-icon size="24" color="amber-darken-1">mdi-white-balance-sunny</v-icon>
          </div>
          <span class="option-name">{{ t('profile.themeLight') }}</span>
          <v-icon v-if="theme === 'light'" size="16" color="blue-darken-1" class="option-check">mdi-check-circle</v-icon>
        </button>
        <button class="theme-option" :class="{ 'option-active': theme === 'dark' }" @click="setTheme('dark')">
          <div class="theme-preview theme-preview-dark">
            <v-icon size="24" color="blue-lighten-2">mdi-moon-waning-crescent</v-icon>
          </div>
          <span class="option-name">{{ t('profile.themeDark') }}</span>
          <v-icon v-if="theme === 'dark'" size="16" color="blue-darken-1" class="option-check">mdi-check-circle</v-icon>
        </button>
      </div>
    </div>

    <!-- Language section -->
    <div class="section-block">
      <h3 class="section-label">{{ t('profile.language') }}</h3>
      <p class="profile-description">{{ t('profile.languageDescription') }}</p>

      <div class="language-selector">
        <button class="language-option" :class="{ 'option-active': locale === 'en' }" @click="setLocale('en')">
          <span class="language-flag">🇬🇧</span>
          <span class="option-name">{{ t('profile.english') }}</span>
          <v-icon v-if="locale === 'en'" size="16" color="blue-darken-1" class="option-check">mdi-check-circle</v-icon>
        </button>
        <button class="language-option" :class="{ 'option-active': locale === 'pl' }" @click="setLocale('pl')">
          <span class="language-flag">🇵🇱</span>
          <span class="option-name">{{ t('profile.polish') }}</span>
          <v-icon v-if="locale === 'pl'" size="16" color="blue-darken-1" class="option-check">mdi-check-circle</v-icon>
        </button>
      </div>
    </div>

    <!-- Developer Panel -->
    <div class="section-block">
      <h3 class="section-label">{{ t('profile.devPanel') }}</h3>
      <p class="profile-description">{{ t('profile.devPanelDesc') }}</p>

      <div class="dev-panel">
        <!-- Add resources -->
        <div class="dev-section">
          <span class="dev-section-title">{{ t('profile.devAddResources') }}</span>
          <div class="dev-btn-row">
            <v-btn size="x-small" variant="outlined" color="amber-darken-1" class="text-none font-weight-bold" @click="devAddGold()">+1000 Gold</v-btn>
            <v-btn size="x-small" variant="outlined" color="brown" class="text-none font-weight-bold" @click="devAddWood()">+500 Wood</v-btn>
            <v-btn size="x-small" variant="outlined" color="grey" class="text-none font-weight-bold" @click="devAddStone()">+500 Stone</v-btn>
            <v-btn size="x-small" variant="outlined" color="blue-grey" class="text-none font-weight-bold" @click="devAddMetal()">+200 Metal</v-btn>
            <v-btn size="x-small" variant="outlined" color="purple" class="text-none font-weight-bold" @click="devAddMana()">+500 Mana</v-btn>
          </div>
          <div class="dev-btn-row mt-2">
            <v-btn size="x-small" variant="outlined" color="grey-darken-1" class="text-none font-weight-bold" @click="devAddScraps()">+100 Scraps</v-btn>
            <v-btn size="x-small" variant="outlined" color="deep-purple" class="text-none font-weight-bold" @click="devAddDust()">+100 Dust</v-btn>
            <v-btn size="x-small" variant="outlined" color="green" class="text-none font-weight-bold" @click="devAddItem()">+Random Item</v-btn>
          </div>
        </div>

        <!-- Unlock all -->
        <div class="dev-section">
          <span class="dev-section-title">{{ t('profile.devUnlockAll') }}</span>
          <div class="dev-btn-row">
            <v-btn size="x-small" variant="outlined" color="blue-darken-1" class="text-none font-weight-bold" @click="devUnlockAll()">{{ t('profile.devUnlockAllBtn') }}</v-btn>
          </div>
        </div>

        <!-- Reset -->
        <div class="dev-section dev-danger">
          <span class="dev-section-title">{{ t('profile.devDangerZone') }}</span>
          <div class="dev-btn-row">
            <v-btn size="x-small" variant="flat" color="red-darken-2" class="text-none font-weight-bold" @click="devResetProgress()">{{ t('profile.devResetBtn') }}</v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import { useTheme } from '~/composables/useTheme';
import { useGameStore, type NavId } from '~/stores/useGameStore';

const { t, locale, setLocale } = useI18n();
const { theme, setTheme } = useTheme();
const game = useGameStore();

// Developer panel functions
function devAddGold() { game.addResource('gold', 1000); }
function devAddWood() { game.addResource('wood', 500); }
function devAddStone() { game.addResource('stone', 500); }
function devAddMetal() { game.addResource('metal', 200); }
function devAddMana() { game.addResource('mana', 500); }
function devAddScraps() { game.metalScraps += 100; }
function devAddDust() { game.magicDust += 100; }
function devAddItem() { game.generateRandomItem(); }

function devUnlockAll() {
  const allNavs: NavId[] = ['tavern', 'grand-hall', 'resources', 'quests', 'market', 'research', 'achievements', 'upgrades', 'blacksmith', 'profile'];
  for (const id of allNavs) game.unlockNav(id);
  game.unlockRightSidebar();
}

function devResetProgress() {
  if (!confirm('Are you sure? This will delete ALL game progress.')) return;
  game.stopGameLoop();
  localStorage.removeItem('guild-master-save');
  window.location.reload();
}
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner { max-width: 768px; margin: 0 auto; }
.production-title {
  font-size: 24px; font-weight: 300; color: var(--text-heading);
  margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);
}
.section-block { margin-bottom: 40px; }
.section-label {
  font-size: 12px; font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;
}
.profile-description { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

// Shared option styles
.language-selector, .theme-selector { display: flex; flex-direction: column; gap: 8px; }
.theme-selector { flex-direction: row; gap: 12px; }
.language-option, .theme-option {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  border: 1px solid var(--border-primary); border-radius: 6px;
  background: var(--bg-surface); cursor: pointer; transition: all 0.15s ease;
  width: 100%; text-align: left;
  &:hover { border-color: var(--border-hover); background-color: var(--bg-hover); }
  &.option-active { border-color: var(--color-accent); background-color: var(--color-accent-soft); }
}
.theme-option { flex-direction: column; align-items: center; padding: 20px 16px; flex: 1; }
.theme-preview {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
}
.theme-preview-light { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; }
.theme-preview-dark { background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #3b82f6; }
.language-flag { font-size: 22px; line-height: 1; }
.option-name { font-size: 14px; font-weight: 600; color: var(--text-heading); }
.option-check { margin-left: auto; }

// Developer panel
.dev-panel { display: flex; flex-direction: column; gap: 12px; }
.dev-section {
  padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-card);
}
.dev-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); display: block; margin-bottom: 8px;
}
.dev-btn-row { display: flex; flex-wrap: wrap; gap: 6px; }
.dev-danger { border-color: rgba(239, 83, 80, 0.3); background: rgba(239, 83, 80, 0.04); }
</style>
