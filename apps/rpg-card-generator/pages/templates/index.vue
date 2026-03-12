<template>
  <div class="templates-page">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Moje Szablony</h1>
        <p class="text-medium-emphasis">Zarządzaj własnymi układami kart do ponownego wykorzystania.</p>
      </div>
      <div class="d-flex align-center gap-2">
        <template v-if="templates.length > 0">
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-upload" @click="triggerFileInput">
            Importuj
          </v-btn>
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-download" @click="exportAll" class="mr-2">
            Eksportuj wszystko
          </v-btn>
        </template>
        <template v-else>
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-upload" @click="triggerFileInput" class="mr-2">
            Importuj
          </v-btn>
        </template>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/create?template=true">
          Nowy szablon
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

    <!-- Zbudowane szablony -->
    <div>
      <h2 class="text-h6 mb-4">Wbudowane Szablony</h2>
      <v-row class="mb-6">
        <v-col v-for="tpl in CARD_TEMPLATES" :key="tpl.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="h-100 d-flex flex-column" border>
            <v-card-title>{{ tpl.name }}</v-card-title>
            <v-card-subtitle>{{ tpl.description }}</v-card-subtitle>
            <v-card-text class="mt-auto pt-4 text-caption text-medium-emphasis">
              Rozmiar: {{ tpl.size.name }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-divider class="mb-6"></v-divider>

    <!-- Szablony Użytkownika -->
    <div>
      <h2 class="text-h6 mb-4">Twoje Szablony</h2>
      <v-card v-if="templates.length === 0" class="text-center pa-12 pb-16 bg-card-surface" border>
        <v-icon icon="mdi-cards-outline" size="80" color="grey-darken-2" class="mb-4"></v-icon>
        <h2 class="text-h5 mb-4">Nie masz jeszcze żadnych własnych szablonów</h2>
        <p class="text-body-1 text-medium-emphasis mb-8 max-w-600 mx-auto">
          Zbuduj swój pierwszy w pełni spersonalizowany szablon i zaoszczędź czas! Raz zapisany szablon możesz później aplikować na każdą nową kartę paroma kliknięciami.
        </p>
        <v-btn size="x-large" color="primary" prepend-icon="mdi-plus-box-multiple" to="/create?template=true" elevation="4">
          Stwórz pierwszy szablon
        </v-btn>
      </v-card>

      <v-row v-else>
        <!-- Tu moglibyśmy użyć CardPreview lub okrojonego widoku -->
        <v-col v-for="tpl in templates" :key="tpl.id" cols="12" sm="6" md="4" lg="3">
          <v-card border hover @click="handleEdit(tpl.id)" class="template-card d-flex flex-column h-100 relative">
            <div class="card-header bg-grey-lighten-4 pa-3 d-flex justify-space-between align-center border-b">
              <div class="d-flex flex-column overflow-hidden mr-2">
                <span class="text-truncate text-body-1 font-weight-bold">{{ tpl.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ tpl.size.name }}</span>
              </div>
              <div class="d-flex flex-shrink-0">
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click.stop="handleDelete(tpl.id)" title="Usuń"></v-btn>
              </div>
            </div>
            
            <!-- Uproszczony "Podgląd" (Placeholder dla Szablonu) -->
            <div class="pa-6 d-flex align-center justify-center flex-grow-1 bg-white">
              <v-icon size="64" color="grey-lighten-2">mdi-rhombus-split</v-icon>
            </div>
            
            <v-overlay
              contained
              class="align-center justify-center preview-overlay"
              scrim="black"
              opacity="0.7"
            >
              <div class="d-flex flex-column gap-2">
                <v-btn color="primary" prepend-icon="mdi-pencil" @click.stop="handleEdit(tpl.id)">
                  Edytuj Szablon
                </v-btn>
              </div>
            </v-overlay>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCardsStore } from '~/stores/cards';
import { CARD_TEMPLATES } from '~/data/templates';
import { downloadAsJson, importFromJson } from '~/utils/json-io';
import type { CardTemplate } from '~/types/card';

const store = useCardsStore();
const router = useRouter();

const templates = computed(() => store.allTemplates);
const fileInput = ref<HTMLInputElement | null>(null);

const handleEdit = (id: string) => {
  store.setCurrentEdit(id, true);
  router.push({ path: '/create', query: { id, template: 'true' } });
};

const handleDelete = (id: string) => {
  if (confirm('Czy na pewno chcesz usunąć ten szablon? Tej operacji nie można cofnąć.')) {
    store.deleteTemplate(id);
  }
};

const exportAll = () => {
  if (store.allTemplates.length === 0) return;
  downloadAsJson(store.allTemplates, `wszystkie-szablony-${Date.now()}`);
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
    
    // Walidacja struktury upewniajaca czy importujemy tablice czy pojedynczy obiekt
    const itemsToImport = Array.isArray(importedData) ? importedData : [importedData];
    
    for (const item of itemsToImport) {
      if (item && typeof item === 'object' && 'size' in item && 'background' in item) {
        // Regenerujemy ID dla pewnosci unikniecia kolizji
        const newTemplate: CardTemplate = {
          ...item,
          id: crypto.randomUUID(),
        };
        store.addTemplate(newTemplate);
        count++;
      }
    }
    
    alert(`Pomyślnie zaimportowano ${count} szablonów.`);
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
.templates-page {
  padding: 24px 32px;
  height: 100%;
  overflow-y: auto;
}
.max-w-600 {
  max-width: 600px;
}
.border-b {
  border-bottom: 1px solid #e2e8f0;
}
.template-card {
  position: relative;
  overflow: hidden;
}
.template-card:hover .preview-overlay {
  opacity: 1 !important;
  visibility: visible !important;
}
.preview-overlay {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}
</style>
