<template>
  <section class="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
    <img 
      :src="image"
      :alt="title"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
    <div class="absolute inset-0 flex items-end">
      <div class="max-w-7xl mx-auto px-6 w-full pb-16">
        <div class="flex flex-col gap-4">
          <nav class="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
            <NuxtLink to="/calendar" class="hover:text-white transition-colors">Events</NuxtLink>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
            <span class="text-accent-gold font-bold uppercase tracking-wider text-xs">{{ title }}</span>
          </nav>
          <h1 class="text-4xl md:text-6xl font-black text-white max-w-3xl leading-tight">{{ title }}</h1>
          <div class="flex flex-wrap items-center gap-6 text-white/90">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-accent-gold">calendar_today</span>
              <span class="font-bold">{{ frequency }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-accent-gold">schedule</span>
              <span class="font-bold">{{ time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  image: string
  frequency: string
  time: string
}>()
</script>
