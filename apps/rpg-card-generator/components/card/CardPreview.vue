<template>
  <v-card class="card-preview" hover @click="$emit('edit', card.id)">
    <div class="card-aspect-ratio pa-4" style="display: flex; align-items: center; justify-content: center;">
      <!-- Właściwy Canvas zostanie zaimplementowany w Fazie 4 -->
      <div class="placeholder-preview" :style="[cardDimensionsStyle, backgroundStyle]">
        <h3 class="placeholder-title">{{ card.name }}</h3>
      </div>
    </div>

    <!-- Opcje na hover -->
    <v-overlay
      contained
      class="align-center justify-center preview-overlay"
      scrim="black"
      opacity="0.7"
    >
      <div class="d-flex flex-column gap-2">
        <v-btn color="primary" prepend-icon="mdi-pencil" @click.stop="$emit('edit', card.id)">
          Edytuj
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-content-copy" @click.stop="$emit('duplicate', card.id)">
          Duplikuj
        </v-btn>
        <v-btn color="error" prepend-icon="mdi-delete" @click.stop="$emit('delete', card.id)">
          Usuń
        </v-btn>
      </div>
    </v-overlay>

    <!-- Pasek tytułowy na dole miniaturki -->
    <div class="card-info bg-card-surface pa-2 d-flex justify-space-between align-center">
      <span class="text-truncate text-body-2 font-weight-bold">{{ card.name }}</span>
      <span class="text-caption text-medium-emphasis">{{ card.size.name }}</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '~/types/card';

const props = defineProps<{
  card: Card;
}>();

defineEmits(['edit', 'duplicate', 'delete']);

const cardDimensionsStyle = computed(() => {
  const { widthMm, heightMm } = props.card.size;
  return {
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
  };
});

const backgroundStyle = computed(() => {
  const bg = props.card.background;
  if (!bg) return { background: '#2A2A3E' };

  if (bg.type === 'color') return { background: bg.value };
  if (bg.type === 'gradient') return { background: bg.value };
  if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  
  return { background: '#2A2A3E' };
});
</script>

<style scoped>
.card-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: #121218;
}

.card-aspect-ratio {
  flex-grow: 1;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8px; /* Symulacja wewnętrznego odstępu podglądu */
}

.placeholder-preview {
  width: 100%;
  height: 100%;
  border-radius: 4px; /* Zaokrąglenie rogów by zasygnalizować "kartę" */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.placeholder-title {
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  font-family: inherit;
  font-size: 1.2rem;
  word-break: break-word;
}

.card-info {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 48px;
}

.gap-2 {
  gap: 8px;
}

/* Pokaż overlay na hover v-card'a */
.card-preview:hover .preview-overlay {
  opacity: 1 !important;
  visibility: visible !important;
}

.preview-overlay {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}
</style>
