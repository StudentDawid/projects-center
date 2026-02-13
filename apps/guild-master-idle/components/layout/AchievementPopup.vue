<template>
  <Teleport to="body">
    <Transition name="ach-popup">
      <div v-if="game.achievementPopup" class="ach-overlay" @click.self="game.dismissAchievementPopup()">
        <div class="ach-popup">
          <div class="ach-popup-glow" />
          <div class="ach-popup-header">
            <span class="ach-popup-badge">{{ game.achievementPopup.icon }}</span>
            <span class="ach-popup-label">{{ t('achievements.popupTitle') }}</span>
          </div>
          <h3 class="ach-popup-name">{{ t(game.achievementPopup.nameKey) }}</h3>
          <p class="ach-popup-desc">{{ t(game.achievementPopup.descKey) }}</p>
          <div class="ach-popup-reward">
            <v-icon size="16" color="amber-darken-1" class="mr-1">mdi-gift</v-icon>
            <span class="ach-popup-reward-label">{{ t('achievements.reward') }}:</span>
            <span class="ach-popup-reward-value">{{ t(game.achievementPopup.rewardKey) }}</span>
          </div>
          <v-btn
            color="amber-darken-1" variant="flat" block
            class="mt-4 text-none font-weight-bold"
            @click="game.dismissAchievementPopup()"
          >
            {{ t('achievements.popupCollect') }}
          </v-btn>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
</script>

<style lang="scss" scoped>
.ach-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px);
}
.ach-popup {
  position: relative; background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-primary, #e2e8f0); border-radius: 16px;
  padding: 32px 28px 24px; max-width: 360px; width: 90vw; text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25); overflow: hidden;
}
.ach-popup-glow {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
  pointer-events: none;
}
.ach-popup-header { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 12px; }
.ach-popup-badge { font-size: 3rem; line-height: 1; animation: ach-bounce 0.5s ease; }

@keyframes ach-bounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.ach-popup-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; }
.ach-popup-name { font-size: 1.25rem; font-weight: 800; color: var(--text-heading, #1e293b); margin: 0 0 6px; }
.ach-popup-desc { font-size: 0.875rem; color: var(--text-secondary, #64748b); margin: 0 0 16px; line-height: 1.4; }
.ach-popup-reward {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  padding: 8px 16px; background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; font-size: 0.85rem;
}
.ach-popup-reward-label { font-weight: 600; color: var(--text-secondary, #64748b); }
.ach-popup-reward-value { font-weight: 700; color: #d97706; }

// Popup transition
.ach-popup-enter-active { transition: opacity 0.3s ease; .ach-popup { transition: transform 0.3s ease; } }
.ach-popup-leave-active { transition: opacity 0.25s ease; .ach-popup { transition: transform 0.25s ease; } }
.ach-popup-enter-from { opacity: 0; .ach-popup { transform: scale(0.85) translateY(20px); } }
.ach-popup-leave-to { opacity: 0; .ach-popup { transform: scale(0.95) translateY(-10px); } }
</style>
