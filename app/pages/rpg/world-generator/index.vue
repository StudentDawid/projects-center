<template>
  <div class="world-generator-page">
    <div class="page-header">
      <h1>Generator Świata RPG</h1>
      <div class="controls">
        <button @click="handleGenerate" :disabled="isGenerating" class="generate-btn">
          {{ isGenerating ? 'Generowanie...' : 'Generuj Nowy Świat' }}
        </button>
        <div v-if="progress > 0 && progress < 100" class="progress">
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <p>Błąd: {{ error }}</p>
    </div>

    <div v-if="world" class="world-content">
      <div class="world-info">
        <h2>{{ world.name }}</h2>
        <p class="world-meta">
          Seed: <code>{{ world.seed }}</code> |
          Wygenerowano: {{ formatDate(world.generatedAt) }} |
          Wersja: {{ world.generatorVersion }}
        </p>
      </div>

      <!-- Kosmologia -->
      <CosmologyView :cosmology="world.cosmology" />
    </div>

    <div v-else-if="!isGenerating" class="empty-state">
      <p>Kliknij "Generuj Nowy Świat", aby rozpocząć generowanie.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWorldGenerator } from '~/features/rpg-world-generator/hooks/useWorldGenerator';
import CosmologyView from '~/features/rpg-world-generator/ui/CosmologyView.vue';

const { world, isGenerating, error, progress, generate } = useWorldGenerator();

function handleGenerate(): void {
  const seed = Math.random().toString(36).substring(2, 15);
  generate(seed, `Świat ${seed.substring(0, 8)}`);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

useHead({
  title: 'Generator Świata RPG - Projects Center',
});
</script>

<style scoped lang="scss">
.world-generator-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);

  h1 {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
    color: #fff;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .generate-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .progress {
    flex: 1;
    max-width: 300px;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
  }
}

.error-message {
  padding: 1rem;
  margin-bottom: 2rem;
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.5);
  border-radius: 8px;
  color: #ff6b6b;
}

.world-content {
  .world-info {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #fff;
    }

    .world-meta {
      margin: 0;
      font-size: 0.9rem;
      color: #b0b0b0;

      code {
        padding: 0.2rem 0.4rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #888;

  p {
    font-size: 1.2rem;
  }
}
</style>

