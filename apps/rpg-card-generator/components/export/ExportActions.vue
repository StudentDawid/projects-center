<template>
  <v-card class="pa-4" border>
    <div class="text-subtitle-1 mb-4 font-weight-bold">Podsumowanie Wydruku</div>
    
    <div class="d-flex justify-space-between mb-2">
      <span class="text-medium-emphasis">Wybrane karty:</span>
      <strong>{{ selectCount }}</strong>
    </div>
    
    <div class="d-flex justify-space-between mb-2">
      <span class="text-medium-emphasis">Razem stron druku:</span>
      <strong>{{ totalPages }}</strong>
    </div>

    <v-divider class="my-4"></v-divider>

    <v-btn color="primary" block size="large" prepend-icon="mdi-printer" @click="$emit('print')" :disabled="selectCount === 0">
      Drukuj
    </v-btn>
    
    <div class="text-caption text-medium-emphasis text-center mt-2">
      Otwiera systemowe okno drukowania.<br />
      Włącz "Drukuj tłowe" lub "Background graphics" aby wydruk był poprawny.
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  selectCount: number;
  totalPages: number;
}>();

defineEmits(['print']);
</script>
