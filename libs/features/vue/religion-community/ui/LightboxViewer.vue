<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
      @click.self="$emit('close')"
    >
      <!-- Close button -->
      <button
        class="absolute top-6 right-8 text-white/70 hover:text-white cursor-pointer p-2 transition-colors"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-4xl">close</span>
      </button>

      <!-- Previous button -->
      <button
        class="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-4"
        @click="$emit('prev')"
      >
        <span class="material-symbols-outlined text-6xl">chevron_left</span>
      </button>

      <!-- Image and info -->
      <div class="relative max-w-6xl w-full px-24">
        <img
          :src="photos.at(currentIndex)?.src || ''"
          :alt="photos.at(currentIndex)?.alt || ''"
          class="w-full h-auto max-h-[80vh] object-contain rounded shadow-2xl mx-auto"
        />
        <div class="mt-8 text-center text-white">
          <h4 class="text-2xl font-serif font-bold mb-2">{{ galleryTitle }}</h4>
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
            <span class="text-sm font-medium tracking-widest uppercase">
              Image {{ currentIndex + 1 }} of {{ photos.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Next button -->
      <button
        class="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-4"
        @click="$emit('next')"
      >
        <span class="material-symbols-outlined text-6xl">chevron_right</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from "../data/galleries";

defineProps<{
  photos: GalleryPhoto[];
  currentIndex: number;
  galleryTitle?: string;
}>();

defineEmits<{
  close: [];
  next: [];
  prev: [];
}>();
</script>
