<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">{{ title }}</h3>
      <span v-if="dateRange" class="text-accent-gold text-xs font-bold uppercase tracking-widest">
        {{ dateRange }}
      </span>
    </div>

    <NuxtLink 
      v-for="event in events" 
      :key="event.id"
      :to="`/events/${event.id}`"
      class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 group block"
    >
      <div class="flex items-start gap-4">
        <div class="h-24 w-24 shrink-0 rounded-lg overflow-hidden">
          <img 
            :src="event.image"
            :alt="event.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div class="flex flex-col gap-1 flex-grow">
          <span class="text-[10px] font-bold text-primary uppercase tracking-wider">
            {{ event.category }}
          </span>
          <h4 class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
            {{ event.title }}
          </h4>
          <div class="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span class="material-symbols-outlined text-sm">schedule</span>
            {{ event.time }}
          </div>
          <p class="text-slate-500 text-xs mt-1 line-clamp-2">
            {{ event.description }}
          </p>
        </div>
      </div>
    </NuxtLink>

    <div v-if="events.length === 0" class="text-center py-8 text-slate-500">
      No events scheduled
    </div>
  </div>
</template>

<script setup lang="ts">
interface CalendarEvent {
  id: number
  title: string
  category: string
  time: string
  description: string
  image: string
  date: string
}

withDefaults(
  defineProps<{
    title: string
    events: CalendarEvent[]
    dateRange?: string
  }>(),
  {
    dateRange: undefined
  }
)
</script>
