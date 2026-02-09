<template>
  <div>
    <CalendarHero />
    <section class="py-12 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8">
          <Calendar />
        </div>
        <div class="lg:col-span-4 flex flex-col gap-6">
          <EventsCard 
            title="Upcoming This Week"
            :events="upcomingEvents"
            date-range="Oct 15-21"
          />
          <div class="mt-4 p-6 rounded-xl bg-serene-beige dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 class="font-bold mb-2">Subscribe to Calendar</h4>
            <p class="text-xs text-slate-500 mb-4 leading-relaxed">
              Get all community events synced directly to your phone or computer.
            </p>
            <button class="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">sync</span>
              Add to Google / iCal
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalendarHero from '@features/religion-community/ui/CalendarHero.vue'
import Calendar from '@features/religion-community/ui/Calendar.vue'
import EventsCard from '@features/religion-community/ui/EventsCard.vue'
import { eventsData } from '@features/religion-community/data/events'

const upcomingEvents = computed(() => {
  // Filter events for the upcoming week (Oct 15-21)
  return eventsData.filter(event => {
    const eventDate = new Date(event.date)
    const startDate = new Date(2023, 9, 15) // Oct 15
    const endDate = new Date(2023, 9, 21) // Oct 21
    return eventDate >= startDate && eventDate <= endDate
  })
})

useHead({
  title: 'Community Events Calendar - Sacred Heart Community'
})
</script>
