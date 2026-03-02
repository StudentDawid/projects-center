<template>
  <div class="element-panel d-flex flex-column h-100 w-100" v-if="element">
    <div class="d-flex align-center justify-space-between mb-4 mt-1">
      <div class="text-overline text-medium-emphasis font-weight-bold">WŁAŚCIWOŚCI ELEMENTU</div>
      <v-btn icon="mdi-delete" color="error" variant="text" size="small" density="comfortable" @click="removeCurrentElement"></v-btn>
    </div>

    <div class="d-flex flex-column gap-4 overflow-y-auto pr-2 pb-4">
      
      <!-- Pozycja i rozmiar (%) -->
      <div class="d-flex gap-2">
        <v-text-field label="X (%)" type="number" v-model.number="localUpdates.x" density="compact" hide-details @change="applyUpdates"></v-text-field>
        <v-text-field label="Y (%)" type="number" v-model.number="localUpdates.y" density="compact" hide-details @change="applyUpdates"></v-text-field>
      </div>
      <div class="d-flex gap-2">
        <v-text-field label="Szer. (%)" type="number" v-model.number="localUpdates.width" density="compact" hide-details @change="applyUpdates"></v-text-field>
        <v-text-field label="Wys. (%)" type="number" v-model.number="localUpdates.height" density="compact" hide-details @change="applyUpdates"></v-text-field>
      </div>

      <!-- Tekst właściwości -->
      <template v-if="element.type === 'text'">
        <v-textarea 
          label="Treść tekstu" 
          v-model="localUpdates.content" 
          auto-grow 
          rows="2" 
          density="compact" 
          hide-details 
          @update:model-value="applyUpdates"
        ></v-textarea>
        
        <v-select
          label="Czcionka"
          v-model="localUpdates.fontFamily"
          :items="['Roboto', 'Cinzel, serif', 'MedievalSharp, serif', 'monospace', 'sans-serif']"
          density="compact"
          hide-details
          @update:model-value="applyUpdates"
        ></v-select>

        <div class="d-flex gap-2 align-center">
          <v-text-field label="Rozmiar (pt)" type="number" v-model.number="localUpdates.fontSize" density="compact" hide-details @change="applyUpdates"></v-text-field>
          <input type="color" v-model="localUpdates.color" @input="applyUpdates" style="width: 40px; height: 40px; cursor: pointer;" />
        </div>

        <v-btn-toggle v-model="localUpdates.textAlign" divided density="compact" @update:model-value="applyUpdates" class="w-100 d-flex">
          <v-btn value="left" icon="mdi-format-align-left" class="flex-grow-1"></v-btn>
          <v-btn value="center" icon="mdi-format-align-center" class="flex-grow-1"></v-btn>
          <v-btn value="right" icon="mdi-format-align-right" class="flex-grow-1"></v-btn>
        </v-btn-toggle>
      </template>

      <!-- Obraz właściwości -->
      <template v-if="element.type === 'image'">
        <v-select
          label="Dopasowanie (Object-fit)"
          v-model="localUpdates.objectFit"
          :items="['cover', 'contain', 'fill']"
          density="compact"
          hide-details
          @update:model-value="applyUpdates"
        ></v-select>
        <div class="text-caption mb-n2 mt-2">Przezroczystość</div>
        <v-slider
          v-model="localUpdates.opacity"
          min="0" max="1" step="0.1"
          thumb-label
          density="compact"
          hide-details
          @update:model-value="applyUpdates"
        ></v-slider>
      </template>
      
      <!-- Wspólne przemieszczanie / rotacja -->
      <div class="text-caption mb-n2 mt-2">Rotacja (stopnie)</div>
      <v-slider
        v-model.number="localUpdates.rotation"
        min="0" max="360" step="5"
        thumb-label
        density="compact"
        hide-details
        @update:model-value="applyUpdates"
      ></v-slider>

      <v-text-field label="Z-Index" type="number" v-model.number="localUpdates.zIndex" density="compact" hide-details @change="applyUpdates"></v-text-field>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCardEditor } from '~/composables/useCardEditor';
import type { CardElement } from '~/types/card';

const props = defineProps<{ elementId: string }>();
const { currentCard, updateElement, removeElement } = useCardEditor();

const element = computed(() => currentCard.value?.elements.find(e => e.id === props.elementId));
const localUpdates = ref<any>({});

// Sync local state when element changes
watch(() => element.value, (newEl) => {
  if (newEl) {
    localUpdates.value = JSON.parse(JSON.stringify(newEl));
  }
}, { immediate: true, deep: true });

const applyUpdates = () => {
  if (!element.value) return;
  updateElement(element.value.id, localUpdates.value);
};

const removeCurrentElement = () => {
  if (element.value) {
    if (confirm('Usunąć element?')) {
      removeElement(element.value.id);
    }
  }
};
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.w-100 { width: 100%; }
</style>
