<template>
  <div class="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl mb-12">
    <img 
      :alt="title"
      :src="image"
      class="w-full h-full object-cover"
    />
  </div>
  <div class="mb-10">
    <div class="flex items-center gap-4 mb-6">
      <span class="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
        {{ tag }}
      </span>
      <span class="text-slate-400 text-sm font-semibold flex items-center gap-2">
        <span class="material-symbols-outlined text-base">calendar_today</span>
        {{ date }}
      </span>
    </div>
    <h1 class="font-serif text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
      {{ title }}
    </h1>
    <div class="w-20 h-1 bg-accent-gold"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  tag: string
  date: string
  image: string
}>()
</script>
