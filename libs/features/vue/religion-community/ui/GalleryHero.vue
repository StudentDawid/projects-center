<template>
  <section class="bg-serene-beige dark:bg-background-dark/30 py-16 px-6 border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto">
      <div class="space-y-4">
        <span class="text-accent-gold font-bold tracking-[0.3em] uppercase text-xs">
          {{ dateRange }}
        </span>
        <h1 class="text-5xl md:text-7xl font-black font-serif text-slate-900 dark:text-white leading-tight">
          {{ title }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-3xl text-xl leading-relaxed">
          {{ description }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  dateRange: string;
  description: string;
}>();
</script>
