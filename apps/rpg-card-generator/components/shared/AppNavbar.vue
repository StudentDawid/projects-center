<template>
  <div class="app-navbar d-flex align-center px-6 border-b bg-white flex-shrink-0" style="height: 70px;">
    <!-- LOGO (lewa strona) -->
    <div class="d-flex align-center cursor-pointer" @click="$router.push('/')">
      <v-avatar color="primary" rounded size="36" class="mr-3">
        <v-icon color="white">mdi-rhombus-split</v-icon>
      </v-avatar>
      <span class="text-h6 font-weight-bold">StudioForge</span>
    </div>

    <v-spacer></v-spacer>

    <!-- CENTER (Przełączniki) -->
    <v-btn-toggle
      v-model="currentView"
      mandatory
      variant="outlined"
      class="rounded-lg"
      density="comfortable"
      color="primary"
      style="height: 40px"
    >
      <v-btn value="editor" class="text-none px-6" :to="`/create`" prepend-icon="mdi-view-dashboard-edit-outline">
        Editor
      </v-btn>
      <v-btn value="export" class="text-none px-6" :to="`/export`" prepend-icon="mdi-printer-outline">
        Print Studio
      </v-btn>
    </v-btn-toggle>

    <v-spacer></v-spacer>

    <!-- RIGHT (Akcje) -->
    <div v-if="isEditorPage" class="d-flex align-center gap-3">
      <v-btn variant="outlined" color="secondary" class="bg-white" height="40" @click="onCancel">
        <v-icon start size="small">mdi-close</v-icon>
        Zamknij
      </v-btn>
      <v-btn color="success" height="40" @click="onSave">
        <v-icon start size="small">mdi-content-save-outline</v-icon>
        Zapisz Kartę
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCardEditor } from '~/composables/useCardEditor';

const route = useRoute();
const router = useRouter();
const currentView = ref('editor');
const { currentCard } = useCardEditor();

const isEditorPage = computed(() => route.path !== '/');

const onCancel = () => {
  if (confirm('Niezapisane zmiany mogą zostać utracone. Czy na pewno chcesz zamknąć edytor?')) {
    router.push('/');
  }
};

const onSave = () => {
  if (currentCard.value) {
    // Karta jest zapisywana synchronicznie w useCardEditor i Pine,
    // wystarczy pokazać komunikat symulujący zapis do bazy/serwera.
    alert('Karta zapisana pomyślnie!');
  } else {
    alert('Brak karty do zapisania.');
  }
};

// Obserwacja by podświetlać poprawny toggle przy uruchomieniu lub reloadzie
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/export')) {
    currentView.value = 'export';
  } else {
    currentView.value = 'editor';
  }
});

onMounted(() => {
  if (route.path.startsWith('/export')) {
    currentView.value = 'export';
  }
});
</script>

<style scoped>
.app-navbar { width: 100%; }
.gap-3 { gap: 12px; }
.border-b { border-bottom: 1px solid #e2e8f0 !important; }
</style>
