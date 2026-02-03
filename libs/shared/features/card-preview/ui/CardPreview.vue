<template>
  <div class="card-preview" :class="`preview-type-${card.type}`">
    <div class="card-preview-inner">
      <div class="card-header">
        <div v-if="card.image" class="card-image-large">
          <img :src="card.image" :alt="card.name" />
        </div>
        <div class="card-title-section">
          <h2 class="card-title">{{ card.name }}</h2>
          <span class="card-type-label" :class="`type-${card.type}`">
            {{ getTypeLabel(card.type) }}
          </span>
        </div>
      </div>

      <div class="card-body">
        <p class="card-description-full">{{ card.description }}</p>

        <!-- Equipment specific -->
        <div v-if="card.type === 'equipment' && 'stats' in card" class="card-stats">
          <h3>Statystyki</h3>
          <div class="stats-grid">
            <div v-if="card.stats.attack" class="stat-item">
              <span class="stat-label">Atak:</span>
              <span class="stat-value">{{ card.stats.attack }}</span>
            </div>
            <div v-if="card.stats.defense" class="stat-item">
              <span class="stat-label">Obrona:</span>
              <span class="stat-value">{{ card.stats.defense }}</span>
            </div>
            <div v-if="card.stats.magic" class="stat-item">
              <span class="stat-label">Magia:</span>
              <span class="stat-value">{{ card.stats.magic }}</span>
            </div>
          </div>
        </div>

        <!-- Spell/Skill specific -->
        <div v-if="(card.type === 'spell' || card.type === 'skill') && 'effects' in card" class="card-effects">
          <h3>Efekty</h3>
          <div v-for="(effect, index) in card.effects" :key="index" class="effect-item">
            <strong>{{ effect.name }}:</strong> {{ effect.description }}
          </div>
        </div>

        <!-- Quest specific -->
        <div v-if="card.type === 'quest' && 'conditions' in card" class="card-quest-info">
          <div class="quest-conditions">
            <h3>Warunki</h3>
            <ul>
              <li v-for="(condition, index) in card.conditions" :key="index">
                {{ condition.description }}
              </li>
            </ul>
          </div>
          <div v-if="card.rewards" class="quest-rewards">
            <h3>Nagrody</h3>
            <div class="rewards-list">
              <span v-if="card.rewards.experience">EXP: {{ card.rewards.experience }}</span>
              <span v-if="card.rewards.gold">Złoto: {{ card.rewards.gold }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="card.tags.length > 0" class="card-footer">
        <div class="tags-list">
          <span v-for="tag in card.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card, CardType } from '@shared/entities/card';
import { CardType as CardTypeEnum } from '@shared/entities/card';

defineProps<{
  card: Card;
}>();

function getTypeLabel(type: CardType): string {
  const labels: Record<CardType, string> = {
    [CardTypeEnum.EQUIPMENT]: 'Ekwipunek',
    [CardTypeEnum.SPELL]: 'Czar',
    [CardTypeEnum.SKILL]: 'Umiejętność',
    [CardTypeEnum.QUEST]: 'Zadanie',
    [CardTypeEnum.ITEM]: 'Przedmiot',
    [CardTypeEnum.NPC]: 'NPC',
    [CardTypeEnum.LOCATION]: 'Lokacja',
  };
  return labels[type] || type;
}
</script>

<style scoped lang="scss">
.card-preview {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid #a58c6f;
  border-radius: 0;
  padding: 1.5rem;
  box-shadow:
    inset 0 0 0 1px rgba(182, 140, 79, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(182, 140, 79, 0.05) 2px,
        rgba(182, 140, 79, 0.05) 4px
      );
    pointer-events: none;
  }

  .card-preview-inner {
    position: relative;
    z-index: 1;
  }

  .card-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px double #a58c6f;
  }

  .card-image-large {
    width: 100%;
    height: 200px;
    border-radius: 0;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 2px solid #a58c6f;
    background: rgba(245, 240, 235, 0.5);
    box-shadow: inset 0 0 0 1px rgba(182, 140, 79, 0.2);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-title-section {
    text-align: center;
  }

  .card-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #8b5a3c;
    font-family: 'Cinzel', 'Georgia', serif;
    letter-spacing: 1px;
  }

  .card-type-label {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 0;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Cinzel', 'Georgia', serif;
    border: 1px solid;

    &.type-equipment {
      background: rgba(182, 140, 79, 0.15);
      color: #8b5a3c;
      border-color: #a58c6f;
    }

    &.type-spell {
      background: rgba(139, 100, 165, 0.15);
      color: #7a5a8a;
      border-color: #9b7ba5;
    }

    &.type-skill {
      background: rgba(100, 150, 100, 0.15);
      color: #5a7a5a;
      border-color: #7a9a7a;
    }

    &.type-quest {
      background: rgba(182, 140, 79, 0.2);
      color: #8b5a3c;
      border-color: #b68c4f;
    }

    &.type-item {
      background: rgba(140, 130, 120, 0.15);
      color: #6b5a4a;
      border-color: #8b7a6a;
    }

    &.type-npc {
      background: rgba(165, 100, 100, 0.15);
      color: #8a5a5a;
      border-color: #9a6a6a;
    }

    &.type-location {
      background: rgba(100, 130, 165, 0.15);
      color: #5a6a8a;
      border-color: #6a7a9a;
    }
  }

  .card-body {
    margin-bottom: 1rem;
  }

  .card-description-full {
    color: #2c2a29;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
  }

  .card-stats,
  .card-effects,
  .card-quest-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #a58c6f;

    h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      color: #8b5a3c;
      font-family: 'Cinzel', 'Georgia', serif;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stat-item {
    text-align: center;
    padding: 0.5rem;
    background: rgba(182, 140, 79, 0.1);
    border-radius: 0;
    border: 1px solid #a58c6f;
    box-shadow: inset 0 0 0 1px rgba(182, 140, 79, 0.2);

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: #8b7d6b;
      margin-bottom: 0.25rem;
      font-family: 'Cinzel', 'Georgia', serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      display: block;
      font-size: 1.2rem;
      font-weight: bold;
      color: #8b5a3c;
      font-family: 'Cinzel', 'Georgia', serif;
    }
  }

  .effect-item {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: rgba(182, 140, 79, 0.05);
    border-radius: 0;
    border-left: 3px solid #a58c6f;
    color: #2c2a29;
    font-size: 0.9rem;
    font-family: 'Crimson Pro', 'Georgia', serif;

    strong {
      color: #8b5a3c;
      font-weight: 700;
    }
  }

  .quest-conditions,
  .quest-rewards {
    margin-bottom: 1rem;

    ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      color: #2c2a29;
      font-family: 'Crimson Pro', 'Georgia', serif;
    }

    li {
      margin-bottom: 0.5rem;
    }
  }

  .rewards-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    span {
      padding: 0.4rem 0.8rem;
      background: rgba(182, 140, 79, 0.15);
      border: 1px solid #a58c6f;
      border-radius: 0;
      color: #8b5a3c;
      font-weight: 600;
      font-family: 'Cinzel', 'Georgia', serif;
      font-size: 0.85rem;
    }
  }

  .card-footer {
    padding-top: 1rem;
    border-top: 1px dashed #a58c6f;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.3rem 0.6rem;
    background: rgba(182, 140, 79, 0.1);
    border: 1px solid #a58c6f;
    border-radius: 0;
    font-size: 0.8rem;
    color: #8b5a3c;
    font-family: 'Crimson Pro', 'Georgia', serif;
    font-style: italic;
  }
}
</style>

