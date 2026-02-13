<template>
  <nav v-show="visible" class="sidebar-left">
    <div class="sidebar-top">
      <div class="sidebar-header">
        <span class="sidebar-title">{{ t('sidebarTitle') }}</span>
        <v-btn
          icon variant="text" size="x-small" density="compact"
          :title="t('hideSidebar')" @click="$emit('hide')"
        >
          <v-icon size="16">mdi-chevron-left</v-icon>
        </v-btn>
      </div>

      <ul class="sidebar-nav">
        <li v-for="item in navItems" :key="item.id">
          <a
            href="#" class="sidebar-link"
            :class="{ 'sidebar-active': activeNav === item.id }"
            @click.prevent="$emit('navigate', item.id)"
          >
            <span class="d-flex align-center ga-3">
              <span>{{ item.emoji }}</span>
              <span>{{ t(item.labelKey) }}</span>
            </span>
            <span class="nav-arrow">&rsaquo;</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="sidebar-footer">
      <!-- Resources Status Header with toggle -->
      <button class="resources-toggle" @click="showResources = !showResources">
        <span class="sidebar-footer-title mb-0">{{ t('resources.title') }}</span>
        <v-icon size="14" class="toggle-icon" :class="{ 'rotated': !showResources }">
          mdi-chevron-down
        </v-icon>
      </button>

      <!-- Collapsible Resources Section -->
      <Transition name="collapse">
        <div v-show="showResources" class="resources-content">
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
              <v-progress-linear :model-value="(resources.gold / resources.goldMax) * 100" color="amber-darken-1" height="4" rounded bg-color="grey-lighten-3" />
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
              <v-progress-linear :model-value="(resources.wood / resources.woodMax) * 100" color="green-darken-1" height="4" rounded bg-color="grey-lighten-3" />
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
              <v-progress-linear :model-value="(resources.stone / resources.stoneMax) * 100" color="grey" height="4" rounded bg-color="grey-lighten-3" />
            </div>

            <div class="resource-item">
              <div class="resource-header">
                <span class="resource-label">
                  <span class="resource-emoji">&#x2692;&#xFE0F;</span> {{ t('resources.metal') }}
                </span>
                <span class="resource-values">
                  <span class="resource-amount text-blue-grey-darken-1">{{ formatNumber(resources.metal) }}</span>
                  <span class="resource-max">/ {{ formatNumber(resources.metalMax) }}</span>
                </span>
              </div>
              <v-progress-linear :model-value="(resources.metal / resources.metalMax) * 100" color="blue-grey" height="4" rounded bg-color="grey-lighten-3" />
            </div>

            <div class="resource-item">
              <div class="resource-header">
                <span class="resource-label">
                  <span class="resource-emoji">&#x2728;</span> {{ t('resources.mana') }}
                </span>
                <span class="resource-values">
                  <span class="resource-amount text-blue-darken-1">{{ formatNumber(resources.mana) }}</span>
                  <span class="resource-max">/ {{ formatNumber(resources.manaMax) }}</span>
                </span>
              </div>
              <v-progress-linear :model-value="(resources.mana / resources.manaMax) * 100" color="blue" height="4" rounded bg-color="grey-lighten-3" />
              <div class="resource-regen text-blue-darken-1">+{{ resources.manaRegen }}/s</div>
            </div>
          </div>

          <v-btn color="blue-darken-1" block size="small" class="mt-3 text-none font-weight-bold" variant="flat">
            {{ t('resources.speedUp') }}
          </v-btn>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

defineProps<{
  visible: boolean;
  activeNav: string;
  navItems: { id: string; emoji: string; labelKey: string }[];
}>();

defineEmits<{
  (e: 'hide'): void;
  (e: 'navigate', id: string): void;
}>();

const { t } = useI18n();
const game = useGameStore();
const { resources } = storeToRefs(game);

const showResources = ref(true);

function formatNumber(num: number): string {
  const n = Math.floor(num);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.sidebar-left {
  grid-column: 1;
  border-right: 1px solid var(--border-primary); background: var(--bg-surface);
  display: flex; flex-direction: column; justify-content: space-between;
  overflow-y: auto; overflow-x: hidden; min-width: 0; transition: $transition-theme;
}
.sidebar-top { flex: 1; padding-top: 8px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 20px 16px; }
.sidebar-title { font-size: 13px; font-weight: 700; color: var(--text-heading); letter-spacing: -0.01em; }
.sidebar-nav { list-style: none; padding: 0; margin: 0; }
.sidebar-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; font-size: 14px; font-weight: 500;
  color: var(--text-body); text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
  &:hover { background-color: var(--bg-hover); }
  &.sidebar-active {
    background-color: var(--bg-active); border-right: 4px solid var(--color-accent);
    color: var(--color-accent); font-weight: 600;
  }
}
.nav-arrow { color: var(--text-faint); }
.sidebar-footer { padding: 12px 20px 16px; border-top: 1px solid var(--border-light); }

.resources-toggle {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; background: none; border: none; cursor: pointer; padding: 4px 0 8px;
  &:hover { .sidebar-footer-title { color: var(--text-muted); } }
}
.sidebar-footer-title {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-faint); font-weight: 700; transition: color 0.15s ease;
}
.toggle-icon { color: var(--text-faint); transition: transform 0.25s ease; &.rotated { transform: rotate(-90deg); } }

.resources-content { overflow: hidden; }
.collapse-enter-active, .collapse-leave-active { transition: all 0.25s ease; max-height: 400px; opacity: 1; }
.collapse-enter-from, .collapse-leave-to { max-height: 0; opacity: 0; }

.resource-list { display: flex; flex-direction: column; gap: 10px; }
.resource-item { display: flex; flex-direction: column; gap: 3px; }
.resource-header { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.resource-label { color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 4px; }
.resource-emoji { font-size: 12px; }
.resource-values { font-family: monospace; font-size: 11px; }
.resource-amount { font-weight: 700; }
.resource-max { color: var(--text-faint); font-weight: 400; }
.resource-regen { font-size: 10px; font-family: monospace; text-align: right; margin-top: -1px; }
</style>
