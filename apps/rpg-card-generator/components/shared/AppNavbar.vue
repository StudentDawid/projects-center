<template>
  <div class="app-navbar d-print-none d-flex align-center px-6 border-b bg-white flex-shrink-0" style="height: 70px;">
    <!-- LOGO (lewa strona) -->
    <div class="d-flex align-center cursor-pointer" @click="$router.push('/')">
      <v-avatar color="primary" rounded size="36" class="mr-3">
        <v-icon color="white">mdi-rhombus-split</v-icon>
      </v-avatar>
      <span class="text-h6 font-weight-bold">StudioForge</span>
    </div>

    <!-- MAIN NAV LINKS -->
    <div v-if="!isCreatePage" class="d-flex align-center ml-8 gap-4">
      <v-btn variant="text" class="text-none font-weight-medium" to="/" exact color="primary">Moje Karty</v-btn>
      <v-btn variant="text" class="text-none font-weight-medium" to="/templates" exact color="primary">Szablony</v-btn>
    </div>

    <v-spacer></v-spacer>

    <!-- CENTER / RIGHT Akcje -->
    <div class="d-flex align-center gap-3">
      <!-- Przycisk drukowania (widoczny jeśli są jakiekolwiek karty) -->
      <v-btn v-if="hasCards" color="secondary" variant="tonal" height="40" prepend-icon="mdi-printer" to="/export">
        Drukuj wszystkie
      </v-btn>

      <!-- Nowa Karta (widok główny / wydruk, ale NIE w edytorze) -->
      <v-btn v-if="!isCreatePage" color="primary" height="40" prepend-icon="mdi-plus" to="/create">
        Nowa karta
      </v-btn>

      <!-- Zapis i Zamknij (Tylko w edytorze) -->
      <template v-if="isCreatePage">
        <v-btn variant="outlined" color="primary" class="bg-white mr-2" height="40" @click="onExport" title="Eksportuj do JSON">
          <v-icon start size="small">mdi-database-export</v-icon>
          Eksportuj
        </v-btn>
        <v-btn variant="outlined" color="secondary" class="bg-white" height="40" @click="onCancel">
          <v-icon start size="small">mdi-close</v-icon>
          Zamknij
        </v-btn>
        <v-btn color="success" height="40" @click="onSave">
          <v-icon start size="small">mdi-content-save-outline</v-icon>
          Zapisz Kartę
        </v-btn>
      </template>
    </div>

    <!-- Modal potwierdzenia zamknięcia -->
    <v-dialog v-model="showCancelModal" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pt-4">Niezapisane zmiany</v-card-title>
        <v-card-text>
          Masz niezapisane zmiany. Czy na pewno chcesz zamknąć edytor? Wszystkie modyfikacje od ostatniego zapisu zostaną utracone.
        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showCancelModal = false">Zostań</v-btn>
          <v-btn color="error" variant="text" @click="confirmCancel">Odrzuć i wyjdź</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCardEditor } from '~/composables/useCardEditor';
import { useCardsStore } from '~/stores/cards';
import { downloadAsJson } from '~/utils/json-io';

const route = useRoute();
const router = useRouter();
const { currentCard, saveChanges } = useCardEditor();
const store = useCardsStore();

const isCreatePage = computed(() => route.path.startsWith('/create'));
const hasCards = computed(() => store.allCards.length > 0);

const showCancelModal = ref(false);

const onCancel = () => {
  showCancelModal.value = true;
};

const confirmCancel = () => {
  showCancelModal.value = false;
  router.push('/');
};

const onSave = () => {
  if (currentCard.value) {
    saveChanges();
    alert('Karta zapisana pomyślnie!');
  } else {
    alert('Brak karty do zapisania.');
  }
};

const onExport = () => {
  if (currentCard.value) {
    // Odczytujemy nazwę i usuwamy niedozwolone znaki dyskowe do nazwy pliku
    const rawName = currentCard.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const isTemplate = store.isEditingTemplate;
    const prefix = isTemplate ? 'template' : 'card';
    
    downloadAsJson(currentCard.value, `${prefix}-${rawName}-${Date.now()}`);
  }
};
</script>

<style scoped>
.app-navbar { width: 100%; }
.gap-3 { gap: 12px; }
.border-b { border-bottom: 1px solid #e2e8f0 !important; }
</style>
