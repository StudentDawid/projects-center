<template>
  <v-card class="export-settings pa-4 mb-4" border>
    <div class="text-subtitle-1 mb-2 font-weight-bold">Ustawienia Wydruku</div>
    <v-select
      label="Rozmiar Strony"
      :items="PAGE_SIZES"
      item-title="name"
      item-value="id"
      v-model="selectedPageId"
      density="compact"
    ></v-select>

    <div class="d-flex gap-4">
      <v-text-field
        label="Margines (mm)"
        type="number"
        v-model.number="localSettings.marginMm"
        density="compact"
        @change="emitUpdate"
      ></v-text-field>
      
      <v-text-field
        label="Odstęp (mm)"
        type="number"
        v-model.number="localSettings.gapMm"
        density="compact"
        @change="emitUpdate"
      ></v-text-field>
    </div>

    <v-switch
        v-model="localSettings.duplex"
        label="Druk dwustronny (Duplex)"
        color="primary"
        density="compact"
        hide-details
        @change="emitUpdate"
    ></v-switch>

    <v-switch
        v-model="localSettings.cutLines"
        label="Linie cięcia"
        color="primary"
        density="compact"
        hide-details
        @change="emitUpdate"
    ></v-switch>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ExportSettings } from '~/types/export';
import { useCardExport } from '~/composables/useCardExport';

const props = defineProps<{
  modelValue: ExportSettings;
}>();

const emit = defineEmits(['update:modelValue']);
const { PAGE_SIZES } = useCardExport();

const localSettings = ref<ExportSettings>({ ...props.modelValue });

const selectedPageId = computed({
  get: () => localSettings.value.pageSize.id,
  set: (val) => {
    const size = PAGE_SIZES.find(s => s.id === val);
    if (size) {
      localSettings.value.pageSize = size;
      emitUpdate();
    }
  }
});

const emitUpdate = () => {
  emit('update:modelValue', localSettings.value);
};

watch(() => props.modelValue, (newVal) => {
  localSettings.value = { ...newVal };
}, { deep: true });
</script>

<style scoped>
.gap-4 { gap: 16px; }
</style>
