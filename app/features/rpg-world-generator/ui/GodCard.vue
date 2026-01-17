<template>
  <div class="god-card">
    <div class="god-header">
      <h5>{{ god.name }}</h5>
      <div class="god-badges">
        <span class="power-level" :class="`power-${god.powerLevel}`">
          {{ getPowerLevelName(god.powerLevel) }}
        </span>
        <span v-if="hierarchy" class="hierarchy" :class="`hierarchy-${hierarchy}`">
          {{ getHierarchyName(hierarchy) }}
        </span>
      </div>
    </div>

    <div v-if="god.titles.length > 0" class="god-titles">
      <span v-for="(title, index) in god.titles" :key="index" class="title-badge">
        {{ title }}
      </span>
    </div>

    <p class="god-description">{{ god.description }}</p>

    <div class="god-details">
      <div class="detail-row">
        <strong>Domeny:</strong>
        <div class="domains">
          <span
            v-for="(domain, index) in god.domains"
            :key="index"
            class="domain-badge"
          >
            {{ getDomainName(domain) }}
          </span>
        </div>
      </div>

      <div class="detail-row">
        <strong>Osobowość:</strong>
        <span>{{ getPersonalityName(god.personality) }}</span>
      </div>

      <div v-if="god.symbol" class="detail-row">
        <strong>Symbol:</strong>
        <span>{{ god.symbol.primary }}</span>
        <span v-if="god.symbol.colors.length > 0" class="symbol-colors">
          <span
            v-for="(color, index) in god.symbol.colors"
            :key="index"
            class="color-dot"
            :style="{ backgroundColor: color }"
            :title="color"
          ></span>
        </span>
      </div>

      <div v-if="god.traits.length > 0" class="detail-row">
        <strong>Cechy:</strong>
        <div class="traits">
          <span v-for="(trait, index) in god.traits" :key="index" class="trait-badge">
            {{ trait }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="god.history.length > 0" class="god-history">
      <strong>Historia:</strong>
      <ul>
        <li v-for="(event, index) in god.history" :key="index">{{ event }}</li>
      </ul>
    </div>

    <div v-if="god.relations.length > 0" class="god-relations">
      <strong>Relacje:</strong>
      <ul>
        <li v-for="(relation, index) in god.relations" :key="index">
          <span class="relation-type" :class="`relation-${relation.relationship}`">
            {{ getRelationName(relation.relationship) }}
          </span>
          <span class="relation-god">Bóg #{{ relation.godId.split('-').pop() }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { God, GodDomain, GodPersonality, GodPowerLevel, PantheonHierarchy } from '~/shared/world-generator/types/cosmology.types';
import {
  GodDomain as GodDomainEnum,
  GodPersonality as GodPersonalityEnum,
  GodPowerLevel as GodPowerLevelEnum,
  GodRelationship,
  PantheonHierarchy as PantheonHierarchyEnum,
} from '~/shared/world-generator/types/cosmology.types';

defineProps<{
  god: God;
  hierarchy?: PantheonHierarchy;
}>();

function getPowerLevelName(level: GodPowerLevel): string {
  const names: Record<GodPowerLevel, string> = {
    [GodPowerLevelEnum.Primordial]: 'Pierwotny',
    [GodPowerLevelEnum.Major]: 'Główny',
    [GodPowerLevelEnum.Minor]: 'Pomniejszy',
    [GodPowerLevelEnum.Demigod]: 'Półbóg',
    [GodPowerLevelEnum.Spirit]: 'Duch',
  };
  return names[level] || level;
}

function getHierarchyName(hierarchy: PantheonHierarchy): string {
  const names: Record<PantheonHierarchy, string> = {
    [PantheonHierarchyEnum.Supreme]: 'Najwyższy',
    [PantheonHierarchyEnum.High]: 'Wysoki',
    [PantheonHierarchyEnum.Middle]: 'Średni',
    [PantheonHierarchyEnum.Low]: 'Niski',
  };
  return names[hierarchy] || hierarchy;
}

function getDomainName(domain: GodDomain): string {
  const names: Record<GodDomain, string> = {
    [GodDomainEnum.War]: 'Wojna',
    [GodDomainEnum.Magic]: 'Magia',
    [GodDomainEnum.Nature]: 'Natura',
    [GodDomainEnum.Death]: 'Śmierć',
    [GodDomainEnum.Life]: 'Życie',
    [GodDomainEnum.Light]: 'Światło',
    [GodDomainEnum.Darkness]: 'Ciemność',
    [GodDomainEnum.Chaos]: 'Chaos',
    [GodDomainEnum.Order]: 'Porządek',
    [GodDomainEnum.Knowledge]: 'Wiedza',
    [GodDomainEnum.Wisdom]: 'Mądrość',
    [GodDomainEnum.Trickery]: 'Podstęp',
    [GodDomainEnum.Justice]: 'Sprawiedliwość',
    [GodDomainEnum.Love]: 'Miłość',
    [GodDomainEnum.Fertility]: 'Płodność',
    [GodDomainEnum.Harvest]: 'Plony',
    [GodDomainEnum.Sea]: 'Morze',
    [GodDomainEnum.Sky]: 'Niebo',
    [GodDomainEnum.Earth]: 'Ziemia',
    [GodDomainEnum.Fire]: 'Ogień',
    [GodDomainEnum.Water]: 'Woda',
    [GodDomainEnum.Wind]: 'Wiatr',
    [GodDomainEnum.Craft]: 'Rzemiosło',
    [GodDomainEnum.Trade]: 'Handel',
    [GodDomainEnum.Travel]: 'Podróże',
    [GodDomainEnum.Protection]: 'Ochrona',
    [GodDomainEnum.Destruction]: 'Zniszczenie',
    [GodDomainEnum.Healing]: 'Leczenie',
    [GodDomainEnum.Disease]: 'Choroba',
    [GodDomainEnum.Madness]: 'Szaleństwo',
    [GodDomainEnum.Dreams]: 'Sny',
    [GodDomainEnum.Time]: 'Czas',
    [GodDomainEnum.Fate]: 'Przeznaczenie',
  };
  return names[domain] || domain;
}

function getPersonalityName(personality: GodPersonality): string {
  const names: Record<GodPersonality, string> = {
    [GodPersonalityEnum.Benevolent]: 'Dobroczynny',
    [GodPersonalityEnum.Malevolent]: 'Złośliwy',
    [GodPersonalityEnum.Neutral]: 'Neutralny',
    [GodPersonalityEnum.Chaotic]: 'Chaotyczny',
    [GodPersonalityEnum.Lawful]: 'Praworządny',
    [GodPersonalityEnum.Capricious]: 'Kapryśny',
    [GodPersonalityEnum.Merciful]: 'Miłosierny',
    [GodPersonalityEnum.Vengeful]: 'Mściwy',
    [GodPersonalityEnum.Wise]: 'Mądry',
    [GodPersonalityEnum.Foolish]: 'Głupi',
    [GodPersonalityEnum.Proud]: 'Dumny',
    [GodPersonalityEnum.Humble]: 'Pokorny',
    [GodPersonalityEnum.Wrathful]: 'Gniewny',
    [GodPersonalityEnum.Peaceful]: 'Pokojowy',
    [GodPersonalityEnum.Jealous]: 'Zazdrosny',
    [GodPersonalityEnum.Generous]: 'Szczodry',
  };
  return names[personality] || personality;
}

function getRelationName(relationship: string): string {
  const names: Record<string, string> = {
    [GodRelationship.Ally]: 'Sojusz',
    [GodRelationship.Enemy]: 'Wróg',
    [GodRelationship.Rival]: 'Rywal',
    [GodRelationship.Lover]: 'Kochanek',
    [GodRelationship.Parent]: 'Rodzic',
    [GodRelationship.Child]: 'Dziecko',
    [GodRelationship.Sibling]: 'Rodzeństwo',
    [GodRelationship.Neutral]: 'Neutralny',
  };
  return names[relationship] || relationship;
}
</script>

<style scoped lang="scss">
.god-card {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .god-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    h5 {
      margin: 0;
      font-size: 1.1rem;
      color: #fff;
    }

    .god-badges {
      display: flex;
      gap: 0.5rem;
    }

    .power-level,
    .hierarchy {
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: bold;

      &.power-primordial {
        background: rgba(255, 215, 0, 0.3);
        color: #ffd700;
      }

      &.power-major {
        background: rgba(102, 126, 234, 0.3);
        color: #b0d4ff;
      }

      &.power-minor {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }

      &.power-demigod {
        background: rgba(255, 193, 7, 0.3);
        color: #ffc107;
      }

      &.power-spirit {
        background: rgba(40, 167, 69, 0.3);
        color: #90ee90;
      }

      &.hierarchy-supreme {
        background: rgba(255, 0, 0, 0.3);
        color: #ff6b6b;
      }

      &.hierarchy-high {
        background: rgba(255, 140, 0, 0.3);
        color: #ff8c00;
      }

      &.hierarchy-middle {
        background: rgba(255, 215, 0, 0.3);
        color: #ffd700;
      }

      &.hierarchy-low {
        background: rgba(192, 192, 192, 0.3);
        color: #c0c0c0;
      }
    }
  }

  .god-titles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .title-badge {
      padding: 0.2rem 0.5rem;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 6px;
      font-size: 0.8rem;
      color: #b0d4ff;
    }
  }

  .god-description {
    margin: 0 0 1rem 0;
    color: #c0c0c0;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .god-details {
    margin-bottom: 1rem;

    .detail-row {
      margin-bottom: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #d0d0d0;

      strong {
        color: #fff;
      }

      .domains,
      .traits {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .domain-badge,
      .trait-badge {
        padding: 0.2rem 0.5rem;
        background: rgba(102, 126, 234, 0.2);
        border-radius: 6px;
        font-size: 0.8rem;
        color: #b0d4ff;
      }

      .symbol-colors {
        display: flex;
        gap: 0.25rem;
      }

      .color-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }
  }

  .god-history,
  .god-relations {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
    color: #d0d0d0;

    strong {
      color: #fff;
      display: block;
      margin-bottom: 0.5rem;
    }

    ul {
      margin: 0.5rem 0 0 1.5rem;
      padding: 0;
    }

    li {
      margin: 0.25rem 0;
    }
  }

  .god-relations {
    .relation-type {
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-right: 0.5rem;

      &.relation-ally {
        background: rgba(40, 167, 69, 0.3);
        color: #90ee90;
      }

      &.relation-enemy {
        background: rgba(220, 53, 69, 0.3);
        color: #ff6b6b;
      }

      &.relation-rival {
        background: rgba(255, 193, 7, 0.3);
        color: #ffd700;
      }

      &.relation-neutral {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
      }
    }

    .relation-god {
      color: #b0b0b0;
      font-size: 0.85rem;
    }
  }
}
</style>

