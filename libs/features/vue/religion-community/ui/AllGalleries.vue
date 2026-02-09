<template>
  <section class="space-y-24 py-20 px-6">
    <div class="max-w-7xl mx-auto space-y-24">
      <div v-for="gallery in galleriesData" :key="gallery.id" class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-accent-gold font-bold tracking-widest uppercase text-xs">
              {{ gallery.date }}
            </span>
            <h2 class="text-3xl font-bold mt-1">{{ gallery.title }}</h2>
            <p class="text-slate-500 mt-2 max-w-xl">{{ gallery.description }}</p>
          </div>
          <NuxtLink
            :to="`/gallery/${gallery.id}`"
            class="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group"
          >
            View Full Album
            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </NuxtLink>
        </div>

        <!-- Preview Grid with +N More overlay -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(photo, idx) in gallery.photos.slice(0, 4)"
            :key="photo.id"
            class="aspect-square overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
          >
            <img
              :src="photo.src"
              :alt="photo.alt"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <!-- +N More overlay on last preview -->
          <div
            v-if="gallery.photos.length > 4"
            class="aspect-square overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow group relative col-span-1 sm:col-span-2 lg:col-span-1"
          >
            <img
              :src="gallery.photos.at(3)?.src || ''"
              :alt="gallery.photos.at(3)?.alt || ''"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span class="text-white font-bold text-xl">+{{ gallery.photos.length - 4 }} More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { galleriesData } from "../data/galleries";
</script>
