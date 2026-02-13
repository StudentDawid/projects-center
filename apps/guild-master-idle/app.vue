<template>
  <div v-if="!isReady" class="loader-screen">
    <div class="loader-content">
      <div class="loader-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" fill="#1e88e5" opacity="0.15" />
          <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" stroke="#1e88e5" stroke-width="2" fill="none" />
          <path d="M24 30l-4-4m0 0l4-4m-4 4h12m4 4l4-4m0 0l-4-4m4 4H28" stroke="#1e88e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(4,2)" />
        </svg>
      </div>
      <h1 class="loader-title">Guild Master</h1>
      <p class="loader-subtitle">Idle</p>
      <div class="loader-bar">
        <div class="loader-bar-fill" />
      </div>
      <p class="loader-hint">Loading guild data...</p>
    </div>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useSettings } from '~/composables/useSettings';
import { applyThemeTokens } from '~/composables/useTheme';

const { isReady, initSettings } = useSettings();

onMounted(async () => {
  const saved = await initSettings();
  applyThemeTokens(saved.theme);
});
</script>

<style lang="scss">
.loader-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loader-icon {
  margin-bottom: 16px;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.loader-title {
  font-size: 32px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
}

.loader-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin: 0 0 24px;
}

.loader-bar {
  width: 200px;
  height: 3px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
}

.loader-bar-fill {
  height: 100%;
  width: 40%;
  background: #3b82f6;
  border-radius: 4px;
  animation: loader-slide 1.2s ease-in-out infinite;
}

@keyframes loader-slide {
  0% { transform: translateX(-100%); width: 40%; }
  50% { width: 60%; }
  100% { transform: translateX(350%); width: 40%; }
}

.loader-hint {
  font-size: 11px;
  color: #475569;
  margin: 12px 0 0;
  font-family: monospace;
}
</style>
