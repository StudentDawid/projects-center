<template>
  <div 
    class="card-container" 
    :style="containerStyle"
    :class="{ 'show-bleed': showBleed }"
    @click="$emit('deselect')"
  >
    <!-- Background layer -->
    <div class="card-bg" :style="bgStyle"></div>

    <!-- Elements layer -->
    <template v-if="side === 'front'">
      <CardElement
        v-for="element in card.elements"
        :key="element.id"
        :element="element"
        :is-selected="selectedElement === element.id"
        :editable="true"
        @select="$emit('select', element.id)"
        @update="$emit('update', element.id, $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '~/types/card';
import CardElement from './CardElement.vue';

const props = defineProps<{
  card: Card;
  side: 'front' | 'back';
  selectedElement: string | null;
  showBleed?: boolean;
}>();

defineEmits(['select', 'deselect', 'update']);

const containerStyle = computed(() => {
  const { widthMm, heightMm } = props.card.size;
  // Canvas zachowuje stałe, bezwzględne rozmiary fizyczne dla podglądu 1:1 i poprawnych operacji na wydruku.
  return {
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    backgroundColor: 'white', /* Jasne domyślne tło */
    transition: 'all 0.3s ease'
  };
});

const bgStyle = computed(() => {
  const bg = props.side === 'front' ? props.card.background : props.card.backBackground;
  const style: any = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0
  };
  
  if (!bg) {
    style.backgroundColor = '#2A2A3E';
    return style;
  }

  if (bg.type === 'color') style.backgroundColor = bg.value;
  else if (bg.type === 'gradient') style.background = bg.value;
  else if (bg.type === 'image') {
    style.backgroundImage = `url(${bg.value})`;
    style.backgroundSize = 'cover';
  }
  return style;
});
</script>

<style scoped>
.card-container {
  background-color: #fff; /* fallback */
  position: relative; /* upewnijmy sie dla ::after */
}

/* Krawędzie do trybu bezpiecznego (bleed) - symulacja */
.card-container::after {
  content: '';
  position: absolute;
  top: 4%; left: 4%; right: 4%; bottom: 4%;
  border: 2px dashed rgba(239, 68, 68, 0.8); /* border-error z Vuetify */
  pointer-events: none; /* Nie blokuj kliknięć w elementy wewnątrz karty */
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 50; /* ponad wszystkie warstwy tła */
}

/* Włączenie ramki dla Bleed Zone */
.show-bleed::after {
  opacity: 1;
}
</style>
