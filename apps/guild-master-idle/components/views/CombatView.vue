<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('combat.title') }}</h2>
    <p class="view-subtitle">{{ t('combat.subtitle') }}</p>

    <!-- No heroes guard -->
    <div v-if="guildHeroes.length === 0" class="empty-state">
      <v-icon size="48" color="grey-lighten-1">mdi-account-alert</v-icon>
      <p class="empty-text">{{ t('combat.noHeroes') }}</p>
    </div>

    <template v-else>
      <!-- PHASE: selecting encounter & party -->
      <template v-if="combat.phase === 'idle' || combat.phase === 'selecting'">
        <!-- Encounter selection -->
        <div class="section-block">
          <h3 class="section-label">{{ t('combat.selectEncounter') }}</h3>
          <div class="cb-encounter-grid">
            <div
              v-for="enc in combatEncounters"
              :key="enc.id"
              class="cb-encounter-card"
              :class="{ 'cb-enc-selected': combat.selectedEncounterId === enc.id }"
              @click="combat.selectEncounter(enc.id)"
            >
              <span class="cb-enc-icon">{{ enc.icon }}</span>
              <div class="cb-enc-info">
                <span class="cb-enc-name">{{ t(enc.nameKey) }}</span>
                <span class="cb-enc-desc">{{ t(enc.descKey) }}</span>
              </div>
              <div class="cb-enc-meta">
                <span class="cb-enc-diff">⭐ {{ enc.difficulty }}</span>
                <span class="cb-enc-reward">{{ enc.rewards.gold }}G</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hero selection -->
        <div class="section-block">
          <h3 class="section-label">{{ t('combat.selectHeroes') }} <span class="roster-count">({{ combat.selectedHeroIds.length }}/4 — {{ t('combat.maxParty') }})</span></h3>
          <div class="cb-hero-pick-grid">
            <div
              v-for="hero in guildHeroes"
              :key="hero.id"
              class="cb-hero-pick"
              :class="{ 'cb-hero-picked': combat.selectedHeroIds.includes(hero.id) }"
              @click="combat.toggleHeroSelection(hero.id)"
            >
              <span class="cb-hero-pick-icon">{{ hero.emoji }}</span>
              <div class="cb-hero-pick-info">
                <span class="cb-hero-pick-name">{{ hero.name }}</span>
                <span class="cb-hero-pick-class" :class="`text-${hero.color}`">{{ t(hero.classKey) }}</span>
              </div>
              <div class="cb-hero-pick-stats">
                <span class="stat-chip stat-atk">ATK {{ hero.stats.atk }}</span>
                <span class="stat-chip stat-hp">HP {{ hero.stats.hp }}</span>
                <span class="stat-chip stat-spd">SPD {{ hero.stats.spd }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Start button -->
        <v-btn
          variant="flat" color="red-darken-1" size="large" block
          class="text-none font-weight-bold mt-2"
          :disabled="!combat.selectedEncounterId || combat.selectedHeroIds.length === 0"
          @click="combat.startCombat()"
        >
          ⚔️ {{ t('combat.start') }}
        </v-btn>
      </template>

      <!-- PHASE: fighting / victory / defeat -->
      <template v-if="combat.phase === 'fighting' || combat.phase === 'victory' || combat.phase === 'defeat'">
        <!-- Speed controls -->
        <div class="cb-speed-bar">
          <span class="cb-speed-label">{{ t('combat.speed') }}:</span>
          <v-btn v-for="s in [1, 2, 5]" :key="s" size="x-small"
            :variant="combat.speed === s ? 'flat' : 'outlined'"
            :color="combat.speed === s ? 'amber-darken-1' : 'grey'"
            class="text-none font-weight-bold mx-1" @click="combat.setSpeed(s)">{{ s }}x</v-btn>
        </div>

        <!-- Battle arena -->
        <div class="cb-arena">
          <!-- Hero side -->
          <div class="cb-side cb-side-heroes">
            <h4 class="cb-side-label">{{ t('combat.partyHp') }}</h4>
            <div v-for="entity in combat.heroes" :key="entity.id" class="cb-entity" :class="{ 'cb-entity-dead': !entity.alive }">
              <span class="cb-entity-icon">{{ entity.icon }}</span>
              <div class="cb-entity-info">
                <span class="cb-entity-name">{{ entity.name }}</span>
                <div class="cb-hp-bar">
                  <div class="cb-hp-fill cb-hp-hero" :style="{ width: `${Math.round((entity.hp / entity.maxHp) * 100)}%` }"></div>
                </div>
                <span class="cb-hp-text">{{ entity.hp }}/{{ entity.maxHp }}</span>
                <div class="cb-action-bar">
                  <div class="cb-action-fill" :style="{ width: `${Math.min(100, Math.round(entity.actionBar))}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="cb-vs">VS</div>

          <!-- Enemy side -->
          <div class="cb-side cb-side-enemies">
            <h4 class="cb-side-label">{{ t('combat.enemyHp') }}</h4>
            <div v-for="entity in combat.enemies" :key="entity.id" class="cb-entity" :class="{ 'cb-entity-dead': !entity.alive }">
              <span class="cb-entity-icon">{{ entity.icon }}</span>
              <div class="cb-entity-info">
                <span class="cb-entity-name">{{ t(getEnemyNameKey(entity.id)) }}</span>
                <div class="cb-hp-bar">
                  <div class="cb-hp-fill cb-hp-enemy" :style="{ width: `${Math.round((entity.hp / entity.maxHp) * 100)}%` }"></div>
                </div>
                <span class="cb-hp-text">{{ entity.hp }}/{{ entity.maxHp }}</span>
                <div class="cb-action-bar">
                  <div class="cb-action-fill cb-action-enemy" :style="{ width: `${Math.min(100, Math.round(entity.actionBar))}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Victory / Defeat banner -->
        <div v-if="combat.phase === 'victory'" class="cb-result cb-victory">
          <h3>🏆 {{ t('combat.victory') }}</h3>
          <p>{{ t('combat.victoryDesc') }}</p>
          <p v-if="combat.currentEncounter" class="cb-reward-line">+{{ combat.currentEncounter.rewards.gold }}G</p>
        </div>
        <div v-if="combat.phase === 'defeat'" class="cb-result cb-defeat">
          <h3>💀 {{ t('combat.defeat') }}</h3>
          <p>{{ t('combat.defeatDesc') }}</p>
        </div>

        <!-- Battle log -->
        <div class="cb-log">
          <h4 class="cb-log-title">{{ t('combat.battleLog') }}</h4>
          <div ref="combatLogRef" class="cb-log-entries">
            <div v-for="(entry, i) in combat.log" :key="i" class="cb-log-entry" :class="`cb-log-${entry.type}`">
              <span class="cb-log-tick">[{{ entry.tick }}]</span>
              <span class="cb-log-msg">{{ formatCombatLog(entry) }}</span>
            </div>
          </div>
        </div>

        <!-- Back button -->
        <v-btn
          v-if="combat.phase === 'victory' || combat.phase === 'defeat'"
          variant="flat" color="blue-darken-1" size="large" block
          class="text-none font-weight-bold mt-3"
          @click="combat.resetCombat()"
        >
          {{ t('combat.backToSelect') }}
        </v-btn>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';
import { useCombatStore, ENCOUNTERS, ENEMY_TEMPLATES, type CombatLogEntry } from '~/stores/useCombatStore';

const { t } = useI18n();
const game = useGameStore();
const combat = useCombatStore();
const { guildHeroes } = storeToRefs(game);

const combatEncounters = ENCOUNTERS;
const combatLogRef = ref<HTMLElement | null>(null);

function getEnemyNameKey(entityId: string): string {
  const parts = entityId.split('_');
  const templateId = parts.slice(1, -1).join('_');
  const template = ENEMY_TEMPLATES[templateId];
  return template?.nameKey ?? entityId;
}

function resolveCombatName(name: string): string {
  if (name && name.includes('.')) return t(name);
  return name;
}

function formatCombatLog(entry: CombatLogEntry): string {
  let msg = t(entry.messageKey);
  if (entry.messageParams) {
    for (const [key, val] of Object.entries(entry.messageParams)) {
      const resolved = typeof val === 'string' ? resolveCombatName(val) : String(val);
      msg = msg.replaceAll(`{${key}}`, resolved);
    }
  }
  return msg;
}

// Auto-scroll combat log
watch(
  () => combat.log.length,
  () => {
    nextTick(() => {
      if (combatLogRef.value) {
        combatLogRef.value.scrollTop = combatLogRef.value.scrollHeight;
      }
    });
  },
);

// Clean up combat on unmount
onUnmounted(() => combat.stopCombat());
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
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 32px 0; gap: 8px; }
.empty-text { font-size: 13px; color: var(--text-faint); text-align: center; }
.roster-count { font-weight: 400; color: var(--text-muted); font-size: 11px; text-transform: none; letter-spacing: 0; margin-left: 6px; }

.stat-chip {
  font-size: 10px; font-weight: 700; font-family: monospace;
  padding: 2px 7px; border-radius: 3px; background: var(--bg-hover); color: var(--text-body);
}
.stat-atk { background: rgba(239, 83, 80, 0.15); color: #ef5350; }
.stat-hp { background: rgba(102, 187, 106, 0.15); color: #66bb6a; }
.stat-spd { background: rgba(255, 167, 38, 0.15); color: #ffa726; }

.cb-encounter-grid { display: flex; flex-direction: column; gap: 6px; }
.cb-encounter-card {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-card);
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.cb-encounter-card:hover { border-color: var(--text-muted); }
.cb-enc-selected { border-color: #ef5350; background: rgba(239, 83, 80, 0.06); }
.cb-enc-icon { font-size: 22px; }
.cb-enc-info { flex: 1; display: flex; flex-direction: column; }
.cb-enc-name { font-size: 13px; font-weight: 700; color: var(--text-heading); }
.cb-enc-desc { font-size: 10px; color: var(--text-muted); }
.cb-enc-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.cb-enc-diff { font-size: 10px; font-weight: 600; color: var(--text-muted); }
.cb-enc-reward { font-size: 11px; font-weight: 700; color: #ffa726; font-family: monospace; }

.cb-hero-pick-grid { display: flex; flex-direction: column; gap: 5px; }
.cb-hero-pick {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-card);
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.cb-hero-pick:hover { border-color: var(--text-muted); }
.cb-hero-picked { border-color: #42a5f5; background: rgba(66, 165, 245, 0.08); }
.cb-hero-pick-icon { font-size: 20px; }
.cb-hero-pick-info { flex: 1; display: flex; flex-direction: column; }
.cb-hero-pick-name { font-size: 12px; font-weight: 700; color: var(--text-heading); }
.cb-hero-pick-class { font-size: 10px; font-weight: 600; }
.cb-hero-pick-stats { display: flex; gap: 4px; }

.cb-speed-bar { display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.cb-speed-label { font-size: 11px; font-weight: 600; color: var(--text-muted); }

.cb-arena { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.cb-side { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.cb-side-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 2px; }
.cb-vs { font-size: 16px; font-weight: 900; color: var(--text-faint); padding: 30px 8px 0; letter-spacing: 2px; }
.cb-entity {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-light); transition: opacity 0.3s;
}
.cb-entity-dead { opacity: 0.35; }
.cb-entity-icon { font-size: 18px; }
.cb-entity-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.cb-entity-name { font-size: 11px; font-weight: 700; color: var(--text-heading); }
.cb-hp-bar { height: 6px; border-radius: 3px; background: var(--bg-hover); overflow: hidden; }
.cb-hp-fill { height: 100%; border-radius: 3px; transition: width 0.15s ease; }
.cb-hp-hero { background: linear-gradient(90deg, #66bb6a, #43a047); }
.cb-hp-enemy { background: linear-gradient(90deg, #ef5350, #c62828); }
.cb-hp-text { font-size: 9px; font-family: monospace; font-weight: 600; color: var(--text-muted); }
.cb-action-bar { height: 4px; border-radius: 2px; background: rgba(66, 165, 245, 0.15); overflow: hidden; margin-top: 1px; }
.cb-action-fill { height: 100%; border-radius: 2px; background: #42a5f5; transition: width 0.08s linear; }
.cb-action-enemy { background: #ffa726; }

.cb-result { text-align: center; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
.cb-result h3 { font-size: 18px; margin-bottom: 4px; }
.cb-result p { font-size: 12px; color: var(--text-muted); }
.cb-victory { background: rgba(102, 187, 106, 0.1); border: 1px solid rgba(102, 187, 106, 0.3); }
.cb-victory h3 { color: #66bb6a; }
.cb-defeat { background: rgba(239, 83, 80, 0.1); border: 1px solid rgba(239, 83, 80, 0.3); }
.cb-defeat h3 { color: #ef5350; }
.cb-reward-line { font-size: 14px; font-weight: 700; font-family: monospace; color: #ffa726; margin-top: 4px; }

.cb-log { border: 1px solid var(--border-light); border-radius: 6px; background: var(--bg-card); overflow: hidden; }
.cb-log-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 8px 10px; border-bottom: 1px solid var(--border-light); color: var(--text-muted);
}
.cb-log-entries { max-height: 180px; overflow-y: auto; padding: 6px 10px; }
.cb-log-entry { font-size: 10px; line-height: 1.6; display: flex; gap: 6px; }
.cb-log-tick { font-family: monospace; font-weight: 600; color: var(--text-faint); min-width: 36px; }
.cb-log-msg { color: var(--text-body); }
.cb-log-attack .cb-log-msg { color: var(--text-body); }
.cb-log-critical .cb-log-msg { color: #ffa726; font-weight: 700; }
.cb-log-miss .cb-log-msg { color: var(--text-faint); font-style: italic; }
.cb-log-heal .cb-log-msg { color: #66bb6a; }
.cb-log-death .cb-log-msg { color: #ef5350; font-weight: 700; }
.cb-log-skill .cb-log-msg { color: #ab47bc; }
.cb-log-double .cb-log-msg { color: #78909c; font-style: italic; }
.cb-log-info .cb-log-msg { color: var(--text-heading); font-weight: 700; }
</style>
