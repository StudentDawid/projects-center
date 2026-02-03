<template>
  <div class="pantheon-card">
    <div class="pantheon-header">
      <h4>{{ pantheon.name }}</h4>
      <span class="god-count">{{ pantheon.gods.length }} bogów</span>
    </div>

    <p class="pantheon-description">{{ pantheon.description }}</p>

    <div class="pantheon-details">
      <div class="detail-item">
        <strong>Głowa Panteonu:</strong>
        <span>{{ headGod?.name || 'Nieznany' }}</span>
      </div>
      <div class="detail-item">
        <strong>Filozofia:</strong>
        <span>{{ pantheon.philosophy }}</span>
      </div>
      <div class="detail-item" v-if="pantheon.beliefs.length > 0">
        <strong>Wierzenia:</strong>
        <ul>
          <li v-for="(belief, index) in pantheon.beliefs" :key="index">{{ belief }}</li>
        </ul>
      </div>
    </div>

    <div class="gods-section">
      <h5>Bogowie:</h5>
      <div class="gods-list">
        <GodCard
          v-for="god in pantheon.gods"
          :key="god.id"
          :god="god"
          :hierarchy="pantheon.hierarchy.get(god.id)"
        />
      </div>
    </div>

    <div v-if="pantheon.pantheonRelations.length > 0" class="pantheon-relations">
      <h5>Relacje z innymi panteonami:</h5>
      <ul>
        <li v-for="rel in pantheon.pantheonRelations" :key="rel.pantheonId">
          <span class="relation-type" :class="`relation-${rel.relationship}`">
            {{ getRelationName(rel.relationship) }}
          </span>
          <span class="relation-description">{{ rel.description }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pantheon } from '@projects-center/shared/world-generator/types/cosmology.types';
import GodCard from './GodCard.vue';

const props = defineProps<{
  pantheon: Pantheon;
}>();

const headGod = props.pantheon.gods.find((g) => g.id === props.pantheon.headGodId);

function getRelationName(relationship: string): string {
  const names: Record<string, string> = {
    allied: 'Sojusz',
    enemy: 'Wrogość',
    neutral: 'Neutralność',
    rival: 'Rywalizacja',
  };
  return names[relationship] || relationship;
}
</script>

<style scoped lang="scss">
.pantheon-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .pantheon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      font-size: 1.3rem;
      color: #fff;
    }

    .god-count {
      padding: 0.25rem 0.75rem;
      background: rgba(102, 126, 234, 0.3);
      border-radius: 12px;
      font-size: 0.85rem;
      color: #b0d4ff;
    }
  }

  .pantheon-description {
    margin: 0 0 1rem 0;
    color: #c0c0c0;
    line-height: 1.6;
  }

  .pantheon-details {
    margin-bottom: 1.5rem;

    .detail-item {
      margin-bottom: 0.75rem;
      color: #d0d0d0;

      strong {
        color: #fff;
        margin-right: 0.5rem;
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

  .gods-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    h5 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #fff;
    }

    .gods-list {
      display: grid;
      gap: 1rem;
    }
  }

  .pantheon-relations {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    h5 {
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      color: #fff;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .relation-type {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;

      &.relation-allied {
        background: rgba(40, 167, 69, 0.3);
        color: #90ee90;
      }

      &.relation-enemy {
        background: rgba(220, 53, 69, 0.3);
        color: #ff6b6b;
      }

      &.relation-neutral {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }

      &.relation-rival {
        background: rgba(255, 193, 7, 0.3);
        color: #ffd700;
      }
    }

    .relation-description {
      color: #b0b0b0;
      font-size: 0.9rem;
    }
  }
}
</style>

