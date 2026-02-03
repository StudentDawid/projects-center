<template>
  <div class="myth-card">
    <div class="myth-header">
      <h4>{{ myth.title }}</h4>
      <span class="myth-type" :class="`type-${myth.type}`">
        {{ getTypeName(myth.type) }}
      </span>
    </div>

    <p class="myth-description">{{ myth.description }}</p>

    <div class="myth-details">
      <div class="detail-item">
        <strong>Chronologia:</strong>
        <span>{{ getChronologyName(myth.chronology) }}</span>
      </div>

      <div v-if="involvedGods.length > 0" class="detail-item">
        <strong>Bogowie zaangażowani:</strong>
        <div class="gods-list">
          <span v-for="god in involvedGods" :key="god.id" class="god-name">
            {{ god.name }}
          </span>
        </div>
      </div>

      <div v-if="myth.consequences.length > 0" class="detail-item">
        <strong>Konsekwencje:</strong>
        <ul>
          <li v-for="(consequence, index) in myth.consequences" :key="index">
            {{ consequence }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Myth, Pantheon } from '@libs/shared/world-generator/types/cosmology.types';

const props = defineProps<{
  myth: Myth;
  pantheons: Pantheon[];
}>();

const involvedGods = computed(() => {
  const allGods = props.pantheons.flatMap((p) => p.gods);
  return props.myth.involvedGods
    .map((godId) => allGods.find((g) => g.id === godId))
    .filter(Boolean) as Array<{ id: string; name: string }>;
});

function getTypeName(type: Myth['type']): string {
  const names: Record<Myth['type'], string> = {
    creation: 'Stworzenie',
    war: 'Wojna',
    love: 'Miłość',
    betrayal: 'Zdrada',
    sacrifice: 'Ofiara',
    triumph: 'Triumf',
    tragedy: 'Tragedia',
    prophecy: 'Przepowiednia',
    other: 'Inne',
  };
  return names[type] || type;
}

function getChronologyName(chronology: Myth['chronology']): string {
  const names: Record<Myth['chronology'], string> = {
    primordial: 'Pierwotna',
    ancient: 'Starżytna',
    historical: 'Historyczna',
    recent: 'Niedawna',
  };
  return names[chronology] || chronology;
}
</script>

<style scoped lang="scss">
.myth-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .myth-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      font-size: 1.2rem;
      color: #fff;
    }

    .myth-type {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;

      &.type-creation {
        background: rgba(102, 126, 234, 0.3);
        color: #b0d4ff;
      }

      &.type-war {
        background: rgba(220, 53, 69, 0.3);
        color: #ff6b6b;
      }

      &.type-love {
        background: rgba(255, 20, 147, 0.3);
        color: #ff69b4;
      }

      &.type-betrayal {
        background: rgba(139, 0, 0, 0.3);
        color: #cd5c5c;
      }

      &.type-sacrifice {
        background: rgba(255, 140, 0, 0.3);
        color: #ff8c00;
      }

      &.type-triumph {
        background: rgba(255, 215, 0, 0.3);
        color: #ffd700;
      }

      &.type-tragedy {
        background: rgba(75, 0, 130, 0.3);
        color: #9370db;
      }

      &.type-prophecy {
        background: rgba(0, 191, 255, 0.3);
        color: #87ceeb;
      }

      &.type-other {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }
    }
  }

  .myth-description {
    margin: 0 0 1rem 0;
    color: #c0c0c0;
    line-height: 1.6;
    font-style: italic;
  }

  .myth-details {
    .detail-item {
      margin-bottom: 0.75rem;
      color: #d0d0d0;
      font-size: 0.9rem;

      strong {
        color: #fff;
        margin-right: 0.5rem;
      }

      .gods-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .god-name {
        padding: 0.2rem 0.5rem;
        background: rgba(102, 126, 234, 0.2);
        border-radius: 6px;
        font-size: 0.85rem;
        color: #b0d4ff;
      }

      ul {
        margin: 0.5rem 0 0 1.5rem;
        padding: 0;
      }

      li {
        margin: 0.25rem 0;
      }
    }
  }
}
</style>

