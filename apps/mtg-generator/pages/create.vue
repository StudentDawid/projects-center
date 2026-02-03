<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <h2>Create Card</h2>
        <MtgCardForm :card="card" />
        <v-btn color="primary" class="mt-4" @click="saveCard">Save Card</v-btn>
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
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMtgCardStore } from '@mtg-generator/features/mtg-card-generator/stores/mtg-card-store';
import MtgCardForm from '@mtg-generator/features/mtg-card-generator/ui/MtgCardForm.vue';
import MtgCard from '@mtg-generator/features/mtg-card-generator/ui/MtgCard.vue';
import type { RpgCard as MtgCardType } from '@mtg-generator/features/mtg-card-generator/types';

const router = useRouter();
const store = useMtgCardStore();

const card = reactive<Partial<MtgCardType>>({
  colorTheme: '#222',
  stats: [],
  tags: [],
});

const saveCard = () => {
  store.addCard(card as any); // Cast for simplicity, validation should make sure it's correct
  router.push('/mtg-card-generator');
};
</script>
