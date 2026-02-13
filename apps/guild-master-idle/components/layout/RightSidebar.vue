<template>
  <aside v-show="visible" class="sidebar-right">
    <div class="sidebar-right-header">
      <v-btn
        icon variant="text" size="x-small" density="compact"
        :title="t('hideSidebar')" @click="$emit('hide')"
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
            <span class="quest-percent">{{ quest.progress }}%</span>
          </div>
          <v-progress-linear :model-value="quest.progress" color="blue" height="8" rounded bg-color="grey-lighten-3" class="mb-1" />
          <div class="quest-eta">ETA: {{ quest.eta }}</div>
        </div>
      </div>

      <div class="contracts-section">
        <h4 class="contracts-title">{{ t('quests.availableContracts') }}</h4>
        <div v-for="contract in availableContracts" :key="contract.id" class="contract-item">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n';

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  (e: 'hide'): void;
}>();

const { t } = useI18n();

// Quests (placeholder data)
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
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.sidebar-right {
  grid-column: 3; border-left: 1px solid var(--border-primary); background: var(--bg-surface);
  display: flex; flex-direction: column; height: 100%;
  overflow-x: hidden; min-width: 0; transition: $transition-theme;
}
.sidebar-right-header { display: flex; justify-content: flex-start; padding: 8px 12px 0; }
.quests-panel { padding: 16px 24px 24px; flex: 1; overflow-y: auto; }
.panel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.panel-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
.quests-list { display: flex; flex-direction: column; gap: 24px; }
.quest-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.quest-name { color: var(--text-heading); }
.quest-percent { font-family: monospace; color: var(--color-accent); }
.quest-eta { font-size: 10px; color: var(--text-faint); }

.contracts-section { margin-top: 40px; }
.contracts-title { font-size: 10px; font-weight: 700; color: var(--text-faint); text-transform: uppercase; margin-bottom: 12px; }
.contract-item {
  padding: 8px; border: 1px dashed var(--border-dashed); border-radius: 4px;
  font-size: 12px; color: var(--text-muted); cursor: pointer;
  transition: background-color 0.15s ease; margin-bottom: 8px;
  &:hover { background-color: var(--bg-hover); }
}

.guild-log {
  height: 33%; border-top: 1px solid var(--border-primary);
  padding: 24px; background-color: var(--bg-log); transition: $transition-theme;
}
.log-entries {
  display: flex; flex-direction: column; gap: 12px; overflow-y: auto;
  max-height: 128px; padding-right: 8px; font-size: 11px; line-height: 1.6;
}
.log-entry { display: flex; gap: 8px; }
.log-time { color: var(--text-faint); flex-shrink: 0; font-family: monospace; font-size: 11px; }
.log-message { color: var(--text-body); }
</style>
