<template>
  <div class="home-page">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Moje Karty</h1>
        <p class="text-medium-emphasis">Zarządzaj swoimi kartami RPG lub stwórz nową.</p>
      </div>
      
      <div v-if="cards.length > 0">
        <v-btn color="primary" prepend-icon="mdi-plus" to="/create" class="mr-2">
          Nowa karta
        </v-btn>
        <v-btn color="secondary" variant="tonal" prepend-icon="mdi-printer" to="/export">
          Drukuj wszystkie
        </v-btn>
      </div>
    </div>

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
    <v-row v-else>
      <v-col v-for="card in cards" :key="card.id" cols="12" sm="6" md="4" lg="3">
        <CardPreview 
          :card="card"
          @edit="handleEdit"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCardsStore } from '~/stores/cards';

const store = useCardsStore();
const router = useRouter();

const cards = computed(() => store.allCards);

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
</script>

<style scoped>
.home-page {
  padding: 24px 32px;
  height: 100%;
  overflow-y: auto;
}
.max-w-600 {
  max-width: 600px;
}
</style>
