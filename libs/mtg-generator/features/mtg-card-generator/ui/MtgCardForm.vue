<template>
  <div class="d-flex flex-column ga-3">
    <v-text-field v-model="model.name" label="Name" />
    <v-textarea v-model="model.description" label="Description" rows="4" />
    <v-text-field v-model="model.colorTheme" label="Color Theme (hex)" />
    <v-text-field
      v-model="tagsInput"
      label="Tags (comma separated)"
      @blur="syncTags"
      @keydown.enter.prevent="syncTags"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { RpgCard } from '../types';

const props = defineProps<{
  card: Partial<RpgCard>;
}>();

const model = props.card as RpgCard;
const tagsInput = ref((model.tags || []).join(', '));

watch(
  () => model.tags,
  (tags) => {
    tagsInput.value = (tags || []).join(', ');
  },
  { deep: true }
);

function syncTags(): void {
  model.tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
</script>
