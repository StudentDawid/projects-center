<template>
  <v-dialog max-width="600">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="secondary" variant="outlined" class="w-100 justify-start mb-2 border-dashed">
        <v-icon start>mdi-palette</v-icon>
        Wybór Tła
      </v-btn>
    </template>
    
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-tabs v-model="tab" bg-color="card-surface">
          <v-tab value="front">Przód Karty</v-tab>
          <v-tab value="back">Tył Karty</v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="tab">
            <v-window-item value="front">
              <div class="d-flex flex-wrap gap-4 mt-4">
                <v-card
                  v-for="bg in CARD_BACKGROUNDS"
                  :key="bg.id"
                  width="120"
                  height="120"
                  hover
                  class="d-flex align-end pb-2 bg-preview"
                  :style="getStyle(bg)"
                  @click="onSelectFront(bg, isActive)"
                >
                  <div class="bg-label w-100 text-center text-caption font-weight-bold">{{ bg.name }}</div>
                </v-card>
              </div>
            </v-window-item>
            <v-window-item value="back">
              <div class="d-flex flex-wrap gap-4 mt-4">
                <v-card
                  v-for="bg in CARD_BACKS"
                  :key="bg.id"
                  width="120"
                  height="120"
                  hover
                  class="d-flex align-end pb-2 bg-preview"
                  :style="getStyle(bg)"
                  @click="onSelectBack(bg, isActive)"
                >
                  <div class="bg-label w-100 text-center text-caption font-weight-bold">{{ bg.name }}</div>
                </v-card>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Zamknij" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCardEditor } from '~/composables/useCardEditor';
import { CARD_BACKGROUNDS, CARD_BACKS } from '~/data/backgrounds';
import type { CardBackground } from '~/types/card';

const { setBackground, setBackBackground } = useCardEditor();
const tab = ref('front');

const getStyle = (bg: CardBackground) => {
  if (bg.type === 'color') return { backgroundColor: bg.value };
  if (bg.type === 'gradient') return { background: bg.value };
  return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover' };
};

const onSelectFront = (bg: CardBackground, isActive: any) => {
  setBackground(bg);
  isActive.value = false;
};

const onSelectBack = (bg: CardBackground, isActive: any) => {
  setBackBackground(bg);
  isActive.value = false;
};
</script>

<style scoped>
.gap-4 { gap: 16px; }
.bg-preview {
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.bg-preview:hover {
  border-color: #7C4DFF;
  transform: scale(1.05);
}
.bg-label {
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px;
}
</style>
