<template>
  <section class="pb-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="masonry-grid">
        <button
          v-for="(photo, idx) in photos"
          :key="photo.id"
          class="cursor-zoom-in overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 bg-transparent border-0 p-0"
          :class="[
            photo.tall ? 'masonry-tall' : '',
            photo.wide ? 'masonry-wide' : '',
          ]"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.src"
            :alt="photo.alt"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </button>
      </div>
    </div>
  </section>

  <!-- Lightbox -->
  <LightboxViewer
    v-if="lightboxOpen"
    :photos="photos"
    :current-index="currentIndex"
    :gallery-title="galleryTitle"
    @close="lightboxOpen = false"
    @next="nextPhoto"
    @prev="prevPhoto"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { GalleryPhoto } from "../data/galleries";
import LightboxViewer from "./LightboxViewer.vue";

const props = defineProps<{
  photos: GalleryPhoto[];
  galleryTitle?: string;
}>();

const lightboxOpen = ref(false);
const currentIndex = ref(0);

const openLightbox = (index: number) => {
  currentIndex.value = index;
  lightboxOpen.value = true;
};

const nextPhoto = () => {
  currentIndex.value = (currentIndex.value + 1) % props.photos.length;
};

const prevPhoto = () => {
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length;
};
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 200px;
  gap: 1.5rem;
}

.masonry-tall {
  grid-row: span 2;
}

.masonry-wide {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .masonry-wide {
    grid-column: span 1;
  }
}
</style>
