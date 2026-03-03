<template>
  <v-card class="card-preview text-black" hover @click="$emit('edit', card.id)">
    <!-- Header karty z tytułem i akcjami -->
    <div class="card-header bg-grey-lighten-4 pa-3 d-flex justify-space-between align-center border-b">
      <div class="d-flex flex-column overflow-hidden mr-2">
        <span class="text-truncate text-body-1 font-weight-bold">{{ card.name }}</span>
        <span class="text-caption text-medium-emphasis">{{ card.size.name }}</span>
      </div>
      <div class="d-flex flex-shrink-0">
        <v-btn icon="mdi-content-copy" size="small" variant="text" color="secondary" @click.stop="$emit('duplicate', card.id)" title="Duplikuj"></v-btn>
        <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click.stop="$emit('delete', card.id)" title="Usuń"></v-btn>
      </div>
    </div>

    <!-- Kontener podglądu -->
    <div class="card-aspect-ratio pa-6 bg-white d-flex align-center justify-center overflow-hidden" ref="containerRef">
      <!-- Obiekty przeskalowane w dół przez scaleFactor by zmieścić format MM w karcie -->
      <div 
        v-if="scaleFactor > 0" 
        class="canvas-wrapper-scaled"
        :style="{ transform: `scale(${scaleFactor})`, transformOrigin: 'center center' }"
      >
        <CardCanvas 
          :card="card" 
          side="front"
          :selected-element="null"
        />
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
      </div>
    </v-overlay>

    <!-- Dół karty usunięto, header jest teraz na górze -->
  </v-card>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { Card } from '~/types/card';
import CardCanvas from './CardCanvas.vue';

const props = defineProps<{
  card: Card;
}>();

defineEmits(['edit', 'duplicate', 'delete']);

const containerRef = ref<HTMLElement | null>(null);
const scaleFactor = ref(0);

// Obserwator do dynamicznego dopasowania rozmiaru fizycznego Canvas do div parenta
let observer: ResizeObserver;

const calculateScale = () => {
  if (!containerRef.value) return;
  const { widthMm, heightMm } = props.card.size;
  
  // Pobieramy ramke (wysokosc rzedu 300px min-height dla okienka)
  const containerWidth = containerRef.value.clientWidth - 48; // pa-6 = 24px * 2 = 48 paddingu
  const containerHeight = Math.min(300, containerRef.value.clientHeight || 300);

  // Symulacja wymiarow PX wyciagnietych z CSS mm przegladarki
  const tempDiv = document.createElement('div');
  tempDiv.style.width = `${widthMm}mm`;
  tempDiv.style.height = `${heightMm}mm`;
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  document.body.appendChild(tempDiv);
  
  const pxWidth = tempDiv.clientWidth;
  const pxHeight = tempDiv.clientHeight;
  document.body.removeChild(tempDiv);
  
  const scaleW = containerWidth / pxWidth;
  const scaleH = containerHeight / pxHeight;
  
  scaleFactor.value = Math.min(scaleW, scaleH);
};

onMounted(() => {
  nextTick(calculateScale);
  if (containerRef.value) {
    observer = new ResizeObserver(calculateScale);
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.card-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
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

.canvas-wrapper-scaled {
  /* Skalowanie wymaga braku pointer eventów jesli z canvasa da sie cos klikac by buga uniknac w evencie click */
  pointer-events: none;
}

.border-b {
  border-bottom: 1px solid #e2e8f0;
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
