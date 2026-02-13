<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('upgrades.title') }}</h2>
    <p class="view-subtitle">{{ t('upgrades.subtitle') }}</p>

    <div class="upgrade-tree">
      <template v-for="row in (game.upgradeTreeMaxRow + 1)" :key="'row-' + row">
        <!-- Nodes in this row -->
        <div class="upgrade-row">
          <div
            v-for="node in game.upgradeTree.filter((n) => n.row === row - 1)"
            :key="node.id"
            class="upgrade-node-wrapper"
            :style="{ gridColumn: node.col + 1 }"
          >
            <div
              class="upgrade-node"
              :class="{
                'node-purchased': node.purchased,
                'node-available': !node.purchased && game.isUpgradeAvailable(node.id),
                'node-locked': !node.purchased && !game.isUpgradeAvailable(node.id),
              }"
            >
              <div class="node-icon">{{ node.icon }}</div>
              <div class="node-info">
                <span class="node-name">{{ t(node.nameKey) }}</span>
                <span class="node-desc">{{ t(node.descKey) }}</span>
                <div v-if="!node.purchased" class="node-cost">
                  <span v-if="node.cost.gold" class="cost-chip cost-gold">{{ node.cost.gold }}G</span>
                  <span v-if="node.cost.wood" class="cost-chip cost-wood">{{ node.cost.wood }}W</span>
                  <span v-if="node.cost.stone" class="cost-chip cost-stone">{{ node.cost.stone }}S</span>
                  <span v-if="node.cost.metal" class="cost-chip cost-metal">{{ node.cost.metal }}M</span>
                </div>
              </div>
              <div class="node-action">
                <v-btn
                  v-if="node.purchased"
                  variant="tonal" color="green" size="x-small"
                  class="text-none font-weight-bold" disabled
                >
                  <v-icon size="14" start>mdi-check</v-icon>
                  {{ t('upgrades.purchased') }}
                </v-btn>
                <v-btn
                  v-else-if="game.isUpgradeAvailable(node.id)"
                  variant="flat" color="amber-darken-1" size="small"
                  class="text-none font-weight-bold"
                  :disabled="resources.gold < node.cost.gold || resources.wood < node.cost.wood || resources.stone < node.cost.stone || resources.metal < node.cost.metal"
                  @click="game.buyUpgrade(node.id)"
                >
                  {{ t('upgrades.buy') }}
                </v-btn>
                <v-chip v-else size="x-small" color="grey" variant="outlined">
                  <v-icon size="12" start>mdi-lock</v-icon>
                  {{ t('upgrades.locked') }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow connector row (except after last row) -->
        <div v-if="row <= game.upgradeTreeMaxRow" class="upgrade-arrow-row">
          <div class="arrow-connector">
            <svg width="100%" height="32" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="32" stroke="var(--border-primary)" stroke-width="2" stroke-dasharray="4,3" />
            </svg>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
const { resources } = storeToRefs(game);
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner { max-width: 768px; margin: 0 auto; }
.production-title {
  font-size: 24px; font-weight: 300; color: var(--text-heading);
  margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);
}
.view-subtitle { font-size: 14px; color: var(--text-muted); margin: -24px 0 32px; }

.upgrade-tree {
  display: flex; flex-direction: column; align-items: center;
  gap: 0; padding: 12px 0 24px;
}
.upgrade-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 12px; width: 100%; max-width: 700px;
}
.upgrade-node-wrapper { display: flex; justify-content: center; }
.upgrade-node {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 14px; border-radius: 12px; border: 2px solid var(--border-primary);
  background: var(--bg-card); width: 100%; max-width: 210px; text-align: center;
  transition: $transition-theme, border-color 0.2s ease, box-shadow 0.2s ease;
}
.node-purchased { border-color: rgba(76, 175, 80, 0.5); background: rgba(76, 175, 80, 0.06); }
.node-available {
  border-color: rgba(251, 191, 36, 0.6); box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
  &:hover { box-shadow: 0 0 20px rgba(251, 191, 36, 0.25); }
}
.node-locked { opacity: 0.5; }
.node-icon { font-size: 2rem; line-height: 1; }
.node-info { display: flex; flex-direction: column; gap: 3px; }
.node-name { font-weight: 700; font-size: 0.85rem; color: var(--text-heading); }
.node-desc { font-size: 0.72rem; color: var(--text-secondary); line-height: 1.3; }
.node-cost { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; margin-top: 4px; }
.node-action { margin-top: 4px; }

.cost-chip { font-size: 0.7rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; line-height: 1.4; }
.cost-gold { background: rgba(251, 191, 36, 0.15); color: #b45309; }
.cost-wood { background: rgba(34, 197, 94, 0.12); color: #15803d; }
.cost-stone { background: rgba(148, 163, 184, 0.15); color: #475569; }
.cost-metal { background: rgba(96, 165, 250, 0.12); color: #1d4ed8; }

.upgrade-arrow-row { display: flex; justify-content: center; width: 100%; max-width: 700px; }
.arrow-connector { width: 100%; height: 32px; display: flex; justify-content: center; }
</style>
