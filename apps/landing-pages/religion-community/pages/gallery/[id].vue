<template>
  <div class="min-h-screen flex flex-col">
    <!-- Back Button and Hero -->
    <section class="pt-12 pb-16 px-6">
      <div class="max-w-7xl mx-auto">
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:-translate-x-1 transition-transform group"
        >
          <span class="material-symbols-outlined text-xl">arrow_back</span>
          Back to Gallery
        </NuxtLink>
        <GalleryHero
          v-if="gallery"
          :title="gallery.title"
          :date-range="gallery.dateRange"
          :description="gallery.description"
        />
      </div>
    </section>

    <!-- Masonry Gallery with Lightbox -->
    <MasonryGallery v-if="gallery" :photos="gallery.photos" :gallery-title="gallery.title" />

    <!-- 404 Fallback -->
    <div v-else class="flex-grow flex items-center justify-center px-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gallery not found</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">The gallery you're looking for doesn't exist.</p>
        <NuxtLink to="/gallery" class="text-primary font-bold hover:underline">
          Back to all galleries
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { galleriesData } from "@features/religion-community/data/galleries";
import GalleryHero from "@features/religion-community/ui/GalleryHero.vue";
import MasonryGallery from "@features/religion-community/ui/MasonryGallery.vue";

const route = useRoute();

const gallery = computed(() => {
  const id = parseInt(route.params.id as string);
  return galleriesData.find((g) => g.id === id);
});
</script>
