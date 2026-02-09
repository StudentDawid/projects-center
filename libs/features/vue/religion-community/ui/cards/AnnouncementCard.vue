<template>
  <NuxtLink :to="`/announcements/${id}`" class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-700 group block">
    <div class="h-52 overflow-hidden relative">
      <img :src="img" alt="card image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded text-xs font-bold">{{ tag }}</div>
    </div>
    <div class="p-6">
      <div class="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">
        <span class="material-symbols-outlined text-sm">calendar_today</span>
        {{ date }}
      </div>
      <h3 class="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{{ title }}</h3>
      <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{{ excerpt }}</p>
      <span class="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-1">Read More <span class="material-symbols-outlined text-sm">chevron_right</span></span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ id: number; img: string; tag: string; date: string; title: string; excerpt: string }>()
</script>

<style scoped></style>
