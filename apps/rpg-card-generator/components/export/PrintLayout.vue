<template>
  <div class="print-layout-preview">
    <div 
      v-for="page in layout.pages" 
      :key="page.pageNumber"
      class="print-page mb-8 elevation-4"
      :style="getPageStyle()"
    >
      <!-- Etykieta strony tylko na ekranie (nie na druku) -->
      <div class="page-label d-print-none text-caption text-medium-emphasis">
        Strona {{ page.pageNumber }} ({{ page.side === 'front' ? 'Przód' : 'Tył' }})
      </div>

      <!-- Karty -->
      <div 
        v-for="(placement, idx) in page.cards" 
        :key="idx"
        class="print-card-placeholder"
        :style="getCardStyle(placement)"
      >
        <CardCanvas 
          :card="getCard(placement.cardId)" 
          :side="page.side" 
          :selectedElement="null"
        />
        
        <!-- Linie cięcia -->
        <template v-if="settings.cutLines">
          <div class="cut-mark tl"></div>
          <div class="cut-mark tr"></div>
          <div class="cut-mark bl"></div>
          <div class="cut-mark br"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PrintLayoutResult, ExportSettings, PrintCardPlacement } from '~/types/export';
import { useCardsStore } from '~/stores/cards';
import CardCanvas from '../card/CardCanvas.vue';

const props = defineProps<{
  layout: PrintLayoutResult;
  settings: ExportSettings;
}>();

const store = useCardsStore();

const getCard = (id: string) => store.cardById(id)!;

const getPageStyle = () => {
  const { widthMm, heightMm } = props.settings.pageSize;
  return {
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
    minHeight: `${heightMm}mm`,
    flexShrink: 0,
    position: 'relative' as const,
    backgroundColor: 'white',
    margin: '0 auto',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const
  };
};

const getCardStyle = (placement: PrintCardPlacement) => {
  return {
    position: 'absolute' as const,
    left: `${placement.x}mm`,
    top: `${placement.y}mm`,
    width: `${placement.width}mm`,
    height: `${placement.height}mm`,
    boxSizing: 'border-box' as const,
  };
};
</script>

<style scoped>
.print-layout-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Pozwól na skalowanie grida na ekranie */
  transform-origin: top center;
}

.page-label {
  position: absolute;
  top: -24px;
  left: 0;
  width: 100%;
  text-align: center;
}

.cut-mark {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 0 solid black;
  z-index: 100;
}

.tl { top: -2px; left: -2px; border-top-width: 0.5px; border-left-width: 0.5px; }
.tr { top: -2px; right: -2px; border-top-width: 0.5px; border-right-width: 0.5px; }
.bl { bottom: -2px; left: -2px; border-bottom-width: 0.5px; border-left-width: 0.5px; }
.br { bottom: -2px; right: -2px; border-bottom-width: 0.5px; border-right-width: 0.5px; }

/* Druk CSS */
@media print {
  .print-page {
    margin: 0 !important;
    box-shadow: none !important;
    page-break-after: always;
  }
  .d-print-none {
    display: none !important;
  }
}
</style>
