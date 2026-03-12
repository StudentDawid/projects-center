<template>
  <div class="home-page">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Moje Karty</h1>
        <p class="text-medium-emphasis">Zarządzaj swoimi kartami RPG lub stwórz nową.</p>
      </div>
      
      <div v-if="cards.length > 0" class="d-flex gap-2">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-upload" @click="triggerFileInput">
          Importuj
        </v-btn>
        <v-btn variant="outlined" color="primary" prepend-icon="mdi-download" @click="exportAll">
          Eksportuj wszystko
        </v-btn>
      </div>
      <div v-else>
         <v-btn variant="tonal" color="primary" prepend-icon="mdi-upload" @click="triggerFileInput">
          Importuj z pliku
        </v-btn>
      </div>
    </div>
    
    <!-- Ukryty input do ladowania pliku JSON -->
    <input 
      type="file" 
      ref="fileInput" 
      accept=".json" 
      style="display: none" 
      @change="handleImport"
    />

    <v-divider class="mb-6"></v-divider>

    <!-- Empty State -->
    <v-card v-if="cards.length === 0" class="text-center pa-12 pb-16 bg-card-surface" border>
      <v-icon icon="mdi-cards" size="80" color="grey-darken-2" class="mb-4"></v-icon>
      <h2 class="text-h5 mb-4">Nie masz jeszcze żadnych kart</h2>
      <p class="text-body-1 text-medium-emphasis mb-8 max-w-600 mx-auto">
        Rozpocznij tworzenie pierwszej karty. Wybierz gotowy szablon, określ rozmiar i dodaj własne grafiki oraz tekst. To potężne narzędzie do projektowania własnych elementów gier RPG.
      </p>
      <v-btn size="x-large" color="primary" prepend-icon="mdi-plus-box-multiple" to="/create" elevation="4">
        Stwórz pierwszą kartę
      </v-btn>
    </v-card>

    <!-- Grid Kart -->
    <draggable 
      v-else 
      v-model="draggableCards" 
      class="v-row mx-0"
      item-key="id" 
      animation="200"
      handle=".drag-handle"
    >
      <template #item="{ element: card }">
        <v-col cols="12" sm="6" md="4" lg="3">
          <CardPreview 
            :card="card"
            class="drag-handle"
            @edit="handleEdit"
            @duplicate="handleDuplicate"
            @delete="handleDelete"
          />
        </v-col>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCardsStore } from '~/stores/cards';
import draggable from 'vuedraggable';
import { downloadAsJson, importFromJson } from '~/utils/json-io';
import type { Card } from '~/types/card';

const store = useCardsStore();
const router = useRouter();

const cards = computed(() => store.allCards);
const fileInput = ref<HTMLInputElement | null>(null);

const draggableCards = computed({
  get: () => store.allCards,
  set: (val) => store.reorderCards(val),
});

const handleEdit = (id: string) => {
  store.setCurrentEdit(id);
  router.push({ path: '/create', query: { id } });
};

const handleDuplicate = (id: string) => {
  store.duplicateCard(id);
};

const handleDelete = (id: string) => {
  if (confirm('Czy na pewno chcesz usunąć tę kartę?')) {
    store.deleteCard(id);
  }
};

const exportAll = () => {
  if (store.allCards.length === 0) return;
  downloadAsJson(store.allCards, `wszystkie-karty-${Date.now()}`);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const importedData = await importFromJson<any>(file);
    let count = 0;
    
    // Walidacja struktury upewniajaca czy importujemy tablice kart czy pojedyncza
    const itemsToImport = Array.isArray(importedData) ? importedData : [importedData];
    
    for (const item of itemsToImport) {
      if (item && typeof item === 'object' && 'size' in item && 'background' in item) {
        // Regenerujemy ID i timestamps dla pewnosci unikniecia kolizji
        const newCard: Card = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        store.addCard(newCard);
        count++;
      }
    }
    
    alert(`Pomyślnie zaimportowano ${count} kart(y).`);
  } catch (error: any) {
    alert(error.message);
  } finally {
    // Resetuj input po odczycie
    if (fileInput.value) fileInput.value.value = '';
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.home-page {
  padding: 24px 32px;
  height: 100%;
  overflow-y: auto;
}
.max-w-600 {
  max-width: 600px;
}
.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
</style>
