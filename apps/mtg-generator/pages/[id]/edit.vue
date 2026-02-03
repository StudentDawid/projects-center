<template>
  <v-container>
    <v-row v-if="card">
      <v-col cols="12" md="6">
        <h2>Edit Card</h2>
        <MtgCardForm :card="card" />
        <v-btn color="primary" class="mt-4" @click="saveCard"
          >Update Card</v-btn
        >
        <v-btn to="/mtg-card-generator" variant="text" class="mt-4 ml-2"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-center align-start pt-10">
        <!-- Preview -->
        <MtgCard :card="card" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMtgCardStore } from '@mtg-generator/features/mtg-card-generator/stores/mtg-card-store';
import MtgCardForm from '@mtg-generator/features/mtg-card-generator/ui/MtgCardForm.vue';
import MtgCard from '@mtg-generator/features/mtg-card-generator/ui/MtgCard.vue';
import type { RpgCard as MtgCardType } from '@mtg-generator/features/mtg-card-generator/types';

const route = useRoute();
const router = useRouter();
const store = useMtgCardStore();

const card = ref<MtgCardType | undefined>(undefined);

onMounted(() => {
  const id = route.params.id as string;
  const existingCard = store.getCard(id);
  if (existingCard) {
    // Clone to avoid direct mutation until save
    card.value = JSON.parse(JSON.stringify(existingCard));
  } else {
    router.push('/mtg-card-generator');
  }
});

const saveCard = () => {
  if (card.value) {
    store.updateCard(card.value.id, card.value);
    router.push('/mtg-card-generator');
  }
};
</script>
