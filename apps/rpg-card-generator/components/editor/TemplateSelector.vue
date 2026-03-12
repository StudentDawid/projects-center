<template>
  <v-dialog max-width="800">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="secondary" variant="outlined" class="w-100 justify-start mb-2 border-dashed">
        <v-icon start>mdi-cards-outline</v-icon>
        Zastosuj Szablon
      </v-btn>
    </template>
    
    <template v-slot:default="{ isActive }">
      <v-card title="Szablony">
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            Zastosowanie szablonu nadpisze aktualny rozmiar, tło oraz elementy na karcie. Usunie wszystkie Twoje zmiany!
          </v-alert>
          <!-- Własne Szablony -->
          <div v-if="userTemplates.length > 0" class="mb-6">
            <h3 class="text-subtitle-1 mb-2">Twoje Szablony</h3>
            <v-row>
              <v-col v-for="tpl in userTemplates" :key="tpl.id" cols="12" sm="6">
                <v-card border hover @click="onSelect(tpl, isActive)" class="h-100 d-flex flex-column">
                  <v-card-title>{{ tpl.name }}</v-card-title>
                  <v-card-text class="mt-auto">
                    Rozmiar: {{ tpl.size.name }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Wbudowane Szablony -->
          <div>
            <h3 class="text-subtitle-1 mb-2">Wbudowane Szablony</h3>
            <v-row>
              <v-col v-for="tpl in CARD_TEMPLATES" :key="tpl.id" cols="12" sm="6">
                <v-card border hover @click="onSelect(tpl, isActive)" class="h-100 d-flex flex-column">
                  <v-card-title>{{ tpl.name }}</v-card-title>
                  <v-card-subtitle>{{ tpl.description }}</v-card-subtitle>
                  <v-card-text class="mt-auto">
                    Rozmiar: {{ tpl.size.name }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Anuluj" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCardEditor } from '~/composables/useCardEditor';
import { useCardsStore } from '~/stores/cards';
import { CARD_TEMPLATES } from '~/data/templates';
import type { CardTemplate } from '~/types/card';

const { applyTemplate } = useCardEditor();
const store = useCardsStore();

const userTemplates = computed(() => store.allTemplates);

const onSelect = (tpl: CardTemplate, isActive: any) => {
  if (confirm('Zastosowanie szablonu nadpisze kartę. Kontynuować?')) {
    applyTemplate(tpl);
    isActive.value = false;
  }
};
</script>
