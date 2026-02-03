<template>
  <div class="plane-card">
    <div class="plane-header">
      <h4>{{ plane.name }}</h4>
      <span class="plane-type" :class="`type-${plane.type}`">
        {{ getTypeName(plane.type) }}
      </span>
    </div>

    <p class="plane-description">{{ plane.description }}</p>

    <div class="plane-details">
      <div v-if="associatedGods.length > 0" class="detail-item">
        <strong>Bogowie związani:</strong>
        <div class="gods-list">
          <span v-for="god in associatedGods" :key="god.id" class="god-name">
            {{ god.name }}
          </span>
        </div>
      </div>

      <div v-if="plane.properties.length > 0" class="detail-item">
        <strong>Właściwości:</strong>
        <ul>
          <li v-for="(property, index) in plane.properties" :key="index">
            {{ property }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plane, Pantheon } from '@projects-center/shared/world-generator/types/cosmology.types';

const props = defineProps<{
  plane: Plane;
  pantheons: Pantheon[];
}>();

const associatedGods = computed(() => {
  const allGods = props.pantheons.flatMap((p) => p.gods);
  return props.plane.associatedGods
    .map((godId) => allGods.find((g) => g.id === godId))
    .filter(Boolean) as Array<{ id: string; name: string }>;
});

function getTypeName(type: Plane['type']): string {
  const names: Record<Plane['type'], string> = {
    material: 'Materialna',
    divine: 'Boska',
    elemental: 'Żywiołowa',
    shadow: 'Cienista',
    astral: 'Astralna',
    void: 'Pustka',
    other: 'Inna',
  };
  return names[type] || type;
}
</script>

<style scoped lang="scss">
.plane-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .plane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      font-size: 1.2rem;
      color: #fff;
    }

    .plane-type {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;

      &.type-material {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }

      &.type-divine {
        background: rgba(255, 215, 0, 0.3);
        color: #ffd700;
      }

      &.type-elemental {
        background: rgba(0, 191, 255, 0.3);
        color: #87ceeb;
      }

      &.type-shadow {
        background: rgba(75, 0, 130, 0.3);
        color: #9370db;
      }

      &.type-astral {
        background: rgba(102, 126, 234, 0.3);
        color: #b0d4ff;
      }

      &.type-void {
        background: rgba(0, 0, 0, 0.5);
        color: #666;
      }

      &.type-other {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }
    }
  }

  .plane-description {
    margin: 0 0 1rem 0;
    color: #c0c0c0;
    line-height: 1.6;
  }

  .plane-details {
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

