<template>
  <div class="cosmology-view">
    <h2 class="section-title">Kosmologia</h2>

    <!-- Historia Stworzenia -->
    <div class="section">
      <h3>Historia Stworzenia</h3>
      <p class="creation-story">{{ cosmology.creationStory }}</p>
    </div>

    <!-- Eony -->
    <div class="section">
      <h3>Eony (Wielkie Epoki)</h3>
      <div class="eons-list">
        <div v-for="(eon, index) in cosmology.eons" :key="index" class="eon-card">
          <h4>{{ eon.name }}</h4>
          <p class="eon-description">{{ eon.description }}</p>
          <p class="eon-duration"><strong>Czas trwania:</strong> {{ eon.duration }}</p>
          <div class="eon-events">
            <strong>Wydarzenia:</strong>
            <ul>
              <li v-for="(event, eventIndex) in eon.events" :key="eventIndex">{{ event }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Panteony -->
    <div class="section">
      <h3>Panteony ({{ cosmology.pantheons.length }})</h3>
      <div class="pantheons-list">
        <PantheonCard
          v-for="pantheon in cosmology.pantheons"
          :key="pantheon.id"
          :pantheon="pantheon"
        />
      </div>
    </div>

    <!-- Mity -->
    <div class="section">
      <h3>Mity ({{ cosmology.myths.length }})</h3>
      <div class="myths-list">
        <MythCard
          v-for="myth in cosmology.myths"
          :key="myth.id"
          :myth="myth"
          :pantheons="cosmology.pantheons"
        />
      </div>
    </div>

    <!-- Płaszczyzny Istnienia -->
    <div class="section">
      <h3>Płaszczyzny Istnienia ({{ cosmology.planes.length }})</h3>
      <div class="planes-list">
        <PlaneCard
          v-for="plane in cosmology.planes"
          :key="plane.id"
          :plane="plane"
          :pantheons="cosmology.pantheons"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cosmology } from '~/shared/world-generator/types/cosmology.types';
import PantheonCard from './PantheonCard.vue';
import MythCard from './MythCard.vue';
import PlaneCard from './PlaneCard.vue';

defineProps<{
  cosmology: Cosmology;
}>();
</script>

<style scoped lang="scss">
.cosmology-view {
  .section-title {
    font-size: 2rem;
    margin: 0 0 2rem 0;
    color: #fff;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.5rem;
  }

  .section {
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: #fff;
    }

    .creation-story {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #d0d0d0;
      font-style: italic;
    }

    .eons-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .eon-card {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);

      h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.2rem;
        color: #fff;
      }

      .eon-description {
        margin: 0 0 0.5rem 0;
        color: #b0b0b0;
      }

      .eon-duration {
        margin: 0.5rem 0;
        color: #a0a0a0;
        font-size: 0.9rem;
      }

      .eon-events {
        margin-top: 1rem;
        color: #c0c0c0;

        ul {
          margin: 0.5rem 0 0 1.5rem;
          padding: 0;
        }

        li {
          margin: 0.25rem 0;
        }
      }
    }

    .pantheons-list,
    .myths-list,
    .planes-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
  }
}
</style>

