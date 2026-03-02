<template>
  <div class="editor-toolbar d-flex flex-column h-100">
    <div class="text-overline text-medium-emphasis font-weight-bold mb-4">NARZĘDZIA EDYCJI</div>

    <div class="d-flex flex-column gap-4 overflow-y-auto">
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-format-text" class="w-100 justify-start" @click="addTextElement">
        Dodaj Tekst
      </v-btn>
      
      <v-btn color="secondary" variant="outlined" prepend-icon="mdi-image" class="w-100 justify-start border-dashed" @click="triggerFileInput">
        Wgraj Obraz
        <input 
          ref="fileInputRef" 
          type="file" 
          accept="image/*" 
          class="d-none" 
          @change="handleFileUpload" 
        />
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCardEditor } from '~/composables/useCardEditor';

const { addTextElement, addImageElement } = useCardEditor();

const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target?.result) {
      addImageElement(event.target.result as string);
    }
  };
  reader.readAsDataURL(file);
  target.value = ''; // Reset
};
</script>

<style scoped>
.gap-4 { gap: 16px; }
</style>
