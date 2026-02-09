<template>
  <div v-if="event">
    <EventHero 
      :title="event.title"
      :image="event.image"
      :frequency="event.frequency"
      :time="event.time"
    />
    <section class="py-16 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-8">
          <EventAbout 
            :description="event.description"
            :highlights="event.highlights"
            :gallery="event.gallery"
          />
        </div>
        <div class="lg:col-span-4">
          <EventDetails 
            :frequency="event.frequency"
            :time="event.time"
            :duration="event.duration"
            :location="event.location"
            :audience="event.audience"
          />
        </div>
      </div>
    </section>
  </div>
  <div v-else class="py-20 px-6 text-center max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-4">Event not found</h1>
    <p class="text-slate-600 dark:text-slate-300 mb-8">The event you're looking for doesn't exist.</p>
    <NuxtLink 
      to="/calendar"
      class="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all"
    >
      Back to Calendar
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EventHero from '@features/religion-community/ui/EventHero.vue'
import EventAbout from '@features/religion-community/ui/EventAbout.vue'
import EventDetails from '@features/religion-community/ui/EventDetails.vue'
import { eventDetailsData } from '@features/religion-community/data/eventDetails'

const route = useRoute()

const event = computed(() => {
  const id = parseInt(route.params.id as string)
  return eventDetailsData.find(e => e.id === id)
})

useHead({
  title: event.value ? `${event.value.title} - Sacred Heart Community` : 'Event - Sacred Heart Community'
})
</script>
