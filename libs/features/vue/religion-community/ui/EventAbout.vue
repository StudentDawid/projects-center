<template>
  <div class="flex flex-col gap-8">
    <!-- About Section -->
    <div>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
        <span class="w-8 h-1 bg-primary rounded-full"></span>
        About the Event
      </h2>
      <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed text-lg">
        <p v-for="(paragraph, idx) in description" :key="`desc-${idx}`">
          {{ paragraph }}
        </p>

        <!-- What to Expect -->
        <div v-if="highlights && highlights.length > 0">
          <h3 class="text-slate-900 dark:text-white font-bold text-xl mt-8 mb-4">What to Expect</h3>
          <ul class="space-y-3">
            <li v-for="(highlight, idx) in highlights" :key="`highlight-${idx}`" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Gallery Section -->
    <div v-if="gallery && gallery.length > 0" class="pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 class="text-xl font-bold mb-6">Past Gatherings</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(image, idx) in gallery" :key="`gallery-${idx}`" class="aspect-square rounded-xl overflow-hidden shadow-sm group">
          <img 
            :src="image"
            :alt="`Event photo ${idx + 1}`"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string[]
  highlights?: string[]
  gallery?: string[]
}>()
</script>
