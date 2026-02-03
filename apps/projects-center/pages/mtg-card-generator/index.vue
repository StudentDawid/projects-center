<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>MTG Card Generator</h1>
        <v-btn
          color="primary"
          to="/mtg-card-generator/create"
          prepend-icon="mdi-plus"
        >
          Create New Card
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="cardStore.cards.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert type="info" variant="tonal" class="mt-4">
          No cards created yet. Start by creating your first card!
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="card in cardStore.cards"
        :key="card.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="d-flex flex-column align-center pt-4" color="#222">
          <MtgCard
            :card="card"
            style="transform: scale(0.9); transform-origin: top center"
          />

          <v-card-actions class="w-100 justify-center">
            <v-tooltip text="Edit" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  :to="`/mtg-card-generator/${card.id}/edit`"
                  variant="text"
                  color="warning"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Duplicate" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-content-copy"
                  variant="text"
                  color="info"
                  @click="cardStore.duplicateCard(card.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Delete" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  @click="deleteCard(card.id)"
                ></v-btn>
              </template>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-btn
      v-if="cardStore.cards.length > 0"
      className="position-fixed bottom-0 right-0 ma-4"
      color="secondary"
      to="/mtg-card-generator/print"
      prepend-icon="mdi-printer"
      elevation="8"
      size="large"
    >
      Print Cards
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useMtgCardStore } from '@projects-center/features/mtg-card-generator/stores/mtg-card-store';
import MtgCard from '@projects-center/features/mtg-card-generator/ui/MtgCard.vue';

const cardStore = useMtgCardStore();

const deleteCard = (id: string) => {
  if (confirm('Are you sure you want to delete this card?')) {
    cardStore.deleteCard(id);
  }
};
</script>
