<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="secondary" variant="outlined" class="w-100 justify-start mb-2 border-dashed">
        <v-icon start>mdi-format-size</v-icon>
        Rozmiar: {{ currentCard?.size?.name || 'Wybierz' }}
      </v-btn>
    </template>
    
    <template v-slot:default="{ isActive }">
      <v-card title="Wybierz rozmiar karty">
        <v-list lines="two">
          <v-list-item 
            v-for="size in CARD_SIZES" 
            :key="size.id"
            :title="size.name"
            :subtitle="`${size.widthMm} x ${size.heightMm} mm (${size.widthInch}&quot; x ${size.heightInch}&quot;)`"
            @click="onSelect(size, isActive)"
          >
            <template v-slot:append v-if="currentCard?.size?.id === size.id">
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Anuluj" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { useCardEditor } from '~/composables/useCardEditor';
import { CARD_SIZES } from '~/data/sizes';

const { currentCard, setSize } = useCardEditor();

const onSelect = (size: any, isActive: any) => {
  setSize(size);
  isActive.value = false;
};
</script>
