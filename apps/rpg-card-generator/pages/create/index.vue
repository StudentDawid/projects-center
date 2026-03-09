<template>
  <div class="editor-page h-100 pa-4 pb-0">
    <v-row class="h-100 flex-nowrap mx-0">
      
      <!-- LEWA KOLUMNA: NARZĘDZIA / WŁAŚCIWOŚCI ELEMENTU -->
      <v-col cols="3" class="h-100 d-flex flex-column border-e px-4 overflow-y-auto bg-white pt-2">
        <ElementPanel 
          v-if="selectedElementId && side === 'front'" 
          :element-id="selectedElementId" 
          :key="selectedElementId"
        />
        <EditorToolbar v-else />
      </v-col>

      <!-- ŚRODEK: CANVAS -->
      <v-col cols="6" class="h-100 d-flex flex-column align-center px-4 bg-surface-variant rounded-xl mx-2 relative overflow-hidden" @click.self="selectedElementId = null">
        <!-- Pasek narzędzi nad kartą -->
        <div class="canvas-tools d-flex align-center justify-center mt-6 py-2 px-6 rounded-pill bg-white border mb-auto" style="z-index: 10;">
          <v-tooltip text="Cofnij" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-undo" variant="text" size="small" density="comfortable" color="secondary" :disabled="historyIndex <= 0" @click="undo"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Ponów" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-redo" variant="text" size="small" density="comfortable" color="secondary" :disabled="historyIndex >= history.length - 1" @click="redo"></v-btn>
            </template>
          </v-tooltip>
          <v-divider vertical class="mx-2"></v-divider>
          <span class="text-caption mr-2 text-medium-emphasis">Bleed Zone</span>
          <v-switch v-model="showBleed" density="compact" hide-details color="primary" class="mr-4 mt-0 pt-0"></v-switch>
          <v-divider vertical class="mx-2"></v-divider>
          <v-btn icon="mdi-magnify-minus-outline" variant="text" size="small" density="comfortable" color="secondary" :disabled="zoomLevel <= 0.2" @click="zoomLevel -= 0.1"></v-btn>
          <span class="text-caption mx-2 font-weight-medium">{{ Math.round(zoomLevel * 100) }}%</span>
          <v-btn icon="mdi-magnify-plus-outline" variant="text" size="small" density="comfortable" color="secondary" :disabled="zoomLevel >= 3" @click="zoomLevel += 0.1"></v-btn>
        </div>

        <!-- Główny podgląd karty ze scrollem dla większych widoków -->
        <div class="canvas-wrapper d-flex align-center justify-center mb-auto overflow-auto" style="flex: 1; width: 100%; min-height: 0;" @click.self="selectedElementId = null">
          <div 
            v-if="currentCard" 
            class="pa-2 border-dashed rounded-xl d-flex align-center justify-center transition-transform" 
            :class="{ 'border-error': showBleed, 'border-transparent': !showBleed }"
            :style="{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              margin: 'auto'
            }"
          >
             <CardCanvas 
              :card="currentCard" 
              :side="side"
              :selected-element="selectedElementId"
              :show-bleed="showBleed"
              @select="selectedElementId = $event"
              @update="updateElementPosition"
              @deselect="selectedElementId = null"
            />
          </div>
        </div>
      </v-col>

      <!-- PRAWA KOLUMNA: USTAWIENIA KARTY (Card Format, itd.) -->
      <v-col cols="3" class="h-100 d-flex flex-column border-s px-4 overflow-y-auto bg-white pt-2">
        <div class="text-overline text-medium-emphasis font-weight-bold mb-4">USTAWIENIA KARTY</div>
        
        <div class="mb-4">
          <label class="text-caption font-weight-medium mb-1 d-block">Nazwa karty</label>
          <v-text-field
            v-if="currentCard"
            v-model="cardName"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="updateName"
          ></v-text-field>
        </div>

        <div class="mb-4">
          <label class="text-caption font-weight-medium mb-1 d-block">Format i Szablon</label>
          <SizeSelector class="w-100 mb-2" />
          <TemplateSelector class="w-100 mb-2" />
          <BackgroundPicker class="w-100 mb-2" />
        </div>

        <v-divider class="my-4"></v-divider>
        <div class="text-overline text-medium-emphasis font-weight-bold mb-4">TRYB WIDOKU</div>
        
        <v-btn-toggle v-model="side" mandatory variant="outlined" class="w-100 mb-6 rounded-lg bg-surface-variant" divided color="primary">
          <v-btn value="front" class="w-50 font-weight-bold text-caption bg-white">PRZÓD</v-btn>
          <v-btn value="back" class="w-50 font-weight-bold text-caption bg-white">TYŁ</v-btn>
        </v-btn-toggle>

        <v-divider class="my-4"></v-divider>
        <div class="text-overline text-medium-emphasis font-weight-bold mb-2">ELEMENTY</div>

        <div v-if="cardElements.length === 0" class="text-caption text-medium-emphasis pa-2">
          Brak elementów. Użyj narzędzi po lewej, aby dodać tekst lub obraz.
        </div>

        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item
            v-for="(el, index) in cardElements"
            :key="el.id"
            :active="selectedElementId === el.id"
            color="primary"
            rounded="lg"
            class="mb-1 element-list-item"
            @click="selectedElementId = el.id"
          >
            <template #prepend>
              <v-icon size="small" class="mr-2">
                {{ el.type === 'text' ? 'mdi-format-text' : 'mdi-image-outline' }}
              </v-icon>
            </template>
            <v-list-item-title class="text-caption">
              {{ el.type === 'text' ? (el.content || 'Tekst') : 'Obraz' }}
            </v-list-item-title>
            <template #append>
              <div class="d-flex align-center pr-1">
                <v-btn
                  icon="mdi-chevron-up"
                  variant="text"
                  size="x-small"
                  color="secondary"
                  :disabled="index === 0"
                  @click.stop="moveLayerUp(index)"
                  class="ml-2"
                ></v-btn>
                <v-btn
                  icon="mdi-chevron-down"
                  variant="text"
                  size="x-small"
                  color="secondary"
                  :disabled="index === cardElements.length - 1"
                  @click.stop="moveLayerDown(index)"
                ></v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>

      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCardsStore } from '~/stores/cards';
import type { Card } from '~/types/card';
import { CARD_SIZES } from '~/data/sizes';
import { CARD_BACKGROUNDS, CARD_BACKS } from '~/data/backgrounds';
import { useCardEditor } from '~/composables/useCardEditor';
import CardCanvas from '~/components/card/CardCanvas.vue';
import EditorToolbar from '~/components/editor/EditorToolbar.vue';
import ElementPanel from '~/components/editor/ElementPanel.vue';
import SizeSelector from '~/components/editor/SizeSelector.vue';
import TemplateSelector from '~/components/editor/TemplateSelector.vue';
import BackgroundPicker from '~/components/editor/BackgroundPicker.vue';

const route = useRoute();
const router = useRouter();
const store = useCardsStore();
const { currentCard, updateElement } = useCardEditor();

const cardName = ref('');
const side = ref<'front' | 'back'>('front');
const selectedElementId = ref<string | null>(null);
const showBleed = ref(false);
const zoomLevel = ref(1.50);

// Undo / Redo logiki
const history = ref<string[]>([]);
const historyIndex = ref(-1);
const isUndoing = ref(false);

watch(() => currentCard.value, (newVal) => {
  if (!newVal || isUndoing.value) return;
  const stateStr = JSON.stringify(newVal);
  // Jeśli to samo co ostatnio, ignoruj po hash'u
  if (historyIndex.value >= 0 && history.value[historyIndex.value] === stateStr) return;
  
  // Jeśli jesteśmy w środku historii i coś zmieniamy, odetnij przyszłość
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  
  history.value.push(stateStr);
  
  // Ograniczenie historii do np. 50 kroków w pamięci
  if (history.value.length > 50) {
    history.value.shift();
  } else {
    historyIndex.value++;
  }
}, { deep: true, immediate: true });

const undo = () => {
  if (historyIndex.value > 0) {
    isUndoing.value = true;
    historyIndex.value--;
    const previousState = JSON.parse(history.value[historyIndex.value]) as Card;
    store.updateCard(previousState.id, previousState);
    setTimeout(() => { isUndoing.value = false; }, 0);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    isUndoing.value = true;
    historyIndex.value++;
    const nextState = JSON.parse(history.value[historyIndex.value]) as Card;
    store.updateCard(nextState.id, nextState);
    setTimeout(() => { isUndoing.value = false; }, 0);
  }
};

const cardElements = computed(() => {
  if (!currentCard.value) return [];
  return [...currentCard.value.elements].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
});

onMounted(() => {
  const idParam = route.query.id as string;
  if (idParam) {
    store.setCurrentEdit(idParam);
    if (currentCard.value) cardName.value = currentCard.value.name;
  } else {
    const newId = crypto.randomUUID();
    store.addCard({
      id: newId,
      name: 'Nowa Karta',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: CARD_SIZES[0]!,
      background: CARD_BACKGROUNDS[0]!,
      backBackground: CARD_BACKS[0]!,
      elements: [],
      templateId: null
    });
    store.setCurrentEdit(newId);
    cardName.value = 'Nowa Karta';
    router.replace({ query: { id: newId } });
  }
});

watch(() => currentCard.value?.name, (newVal) => {
  if (newVal) cardName.value = newVal;
});

const updateName = (val: string) => {
  if (currentCard.value) store.updateCard(currentCard.value.id, { name: val });
};

const updateElementPosition = (id: string, updates: any) => {
  updateElement(id, updates);
};

const moveLayerUp = (index: number) => {
  if (index === 0 || !currentCard.value) return;
  const elementsList = [...cardElements.value];
  const temp = elementsList[index]!;
  elementsList[index] = elementsList[index - 1]!;
  elementsList[index - 1] = temp;
  
  const newElements = elementsList.map((el, i) => ({
    ...el,
    zIndex: elementsList.length - i
  }));
  store.updateCard(currentCard.value.id, { elements: newElements });
};

const moveLayerDown = (index: number) => {
  if (index === cardElements.value.length - 1 || !currentCard.value) return;
  const elementsList = [...cardElements.value];
  const temp = elementsList[index]!;
  elementsList[index] = elementsList[index + 1]!;
  elementsList[index + 1] = temp;
  
  const newElements = elementsList.map((el, i) => ({
    ...el,
    zIndex: elementsList.length - i
  }));
  store.updateCard(currentCard.value.id, { elements: newElements });
};

</script>

<style scoped>
.h-100 { height: 100%; }
.editor-page { 
  height: 100%;
  flex: 1 1 auto;
  overflow: hidden;
}
.border-e { border-right: 1px solid #e2e8f0 !important; }
.border-s { border-left: 1px solid #e2e8f0 !important; }
.border-dashed { border-style: dashed !important; border-width: 2px !important;}
.border-transparent { border-color: transparent !important; }
.card-outline {
  border-color: #ef4444 !important;
}
</style>
