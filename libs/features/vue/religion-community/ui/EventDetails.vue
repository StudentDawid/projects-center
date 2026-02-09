<template>
  <div class="sticky top-28 space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 class="text-xl font-bold mb-6">Event Details</h3>
      <div class="space-y-6">
        <!-- Time -->
        <div class="flex items-start gap-4">
          <div class="bg-primary/10 p-2.5 rounded-lg text-primary">
            <span class="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Time & Frequency</p>
            <p class="font-bold">{{ frequency }}, {{ time }}</p>
            <p class="text-sm text-slate-500">{{ duration }}</p>
          </div>
        </div>

        <!-- Location -->
        <div class="flex items-start gap-4">
          <div class="bg-primary/10 p-2.5 rounded-lg text-primary">
            <span class="material-symbols-outlined">location_on</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
            <p class="font-bold text-primary hover:underline cursor-pointer">{{ location.name }}</p>
            <p class="text-sm text-slate-500">{{ location.address }}</p>
            <a class="inline-flex items-center gap-1 text-xs font-bold text-accent-gold mt-2 uppercase hover:text-accent-gold/80 transition-colors" href="#">
              Open in Maps
              <span class="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>

        <!-- Target Audience -->
        <div class="flex items-start gap-4">
          <div class="bg-primary/10 p-2.5 rounded-lg text-primary">
            <span class="material-symbols-outlined">group</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Who is it for?</p>
            <p class="font-bold">{{ audience.title }}</p>
            <p class="text-sm text-slate-500">{{ audience.ageRange }}</p>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="mt-10 flex flex-col gap-3">
        <button class="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">how_to_reg</span>
          RSVP for Next Service
        </button>
        <button class="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">calendar_add_on</span>
          Add to Calendar
        </button>
      </div>
    </div>

    <!-- Share Section -->
    <div class="bg-serene-beige dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h4 class="font-bold mb-4 text-sm text-center uppercase tracking-widest">Share this event</h4>
      <div class="flex justify-center gap-4">
        <button class="size-12 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:text-primary transition-colors shadow-sm">
          <svg class="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
          </svg>
        </button>
        <button class="size-12 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:text-primary transition-colors shadow-sm">
          <svg class="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
          </svg>
        </button>
        <button class="size-12 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:text-primary transition-colors shadow-sm">
          <span class="material-symbols-outlined">link</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Location {
  name: string
  address: string
}

interface Audience {
  title: string
  ageRange: string
}

defineProps<{
  frequency: string
  time: string
  duration: string
  location: Location
  audience: Audience
}>()
</script>
