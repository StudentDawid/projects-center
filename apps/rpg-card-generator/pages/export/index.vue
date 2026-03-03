<template>
  <div class="export-page d-print-container">
    <div class="d-print-none">
      <div class="d-flex align-center gap-4 mb-6">
        <v-btn icon="mdi-arrow-left" variant="text" to="/"></v-btn>
        <h1 class="text-h4 font-weight-bold text-primary">Kreator Wydruku</h1>
      </div>

      <v-row>
        <v-col cols="12" md="3">
          <PageSizeSelector 
            :model-value="settings" 
            @update:model-value="updateSettings" 
          />
          <ExportActions 
            :selectCount="settings.selectedCardIds.length" 
            :totalPages="layout.totalPages" 
            @print="print" 
          />
          
          <v-card class="pa-4 mt-4" border>
            <div class="text-subtitle-1 font-weight-bold mb-2">Wybierz karty do druku</div>
            <v-list density="compact" class="card-list">
              <v-list-item v-for="card in store.allCards" :key="card.id">
                <template v-slot:prepend>
                  <v-checkbox-btn 
                    v-model="settings.selectedCardIds" 
                    :value="card.id" 
                    hide-details
                  ></v-checkbox-btn>
                </template>
                <v-list-item-title>{{ card.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="9">
          <v-card class="bg-grey-darken-4 pa-8 print-preview-container d-flex justify-center overflow-auto" style="height: calc(100vh - 120px)">
            <PrintLayout :layout="layout" :settings="settings" />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Druk renderuje TYLKO to co w @media print (PrintLayout) -->
    <!-- Vue style block hides main layout on print and only keeps PrintLayout visible -->
    <div class="print-only" style="display: none;">
      <PrintLayout :layout="layout" :settings="settings" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCardsStore } from '~/stores/cards';
import { useCardExport } from '~/composables/useCardExport';
import { calculateLayout } from '~/composables/usePrintLayout';
import PageSizeSelector from '~/components/export/PageSizeSelector.vue';
import ExportActions from '~/components/export/ExportActions.vue';
import PrintLayout from '~/components/export/PrintLayout.vue';

const store = useCardsStore();
const { settings, print, updateSettings } = useCardExport();

// By default select all cards
onMounted(() => {
  settings.value.selectedCardIds = store.allCards.map(c => c.id);
});

const cardsToPrint = computed(() => {
  return store.allCards.filter(c => settings.value.selectedCardIds.includes(c.id));
});

const layout = computed(() => {
  return calculateLayout(cardsToPrint.value, settings.value);
});
</script>

<style scoped>
.gap-4 { gap: 16px; }
.card-list { max-height: 300px; overflow-y: auto; }

@media print {
  .d-print-none {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
}
</style>

<style>
@media print {
  @page {
    margin: 0;
    size: auto;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
    height: 100%;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }

  .print-only {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>
