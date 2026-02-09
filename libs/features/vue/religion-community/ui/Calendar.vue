<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <!-- Header with month and navigation -->
    <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">calendar_month</span>
        {{ monthYear }}
      </h2>
      <div class="flex gap-2">
        <button 
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          @click="previousMonth"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button 
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          @click="nextMonth"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="p-4">
      <!-- Weekday headers -->
      <div class="calendar-grid mb-2">
        <div v-for="day in weekDays" :key="day" class="text-center text-xs font-bold text-slate-400 uppercase py-2">
          {{ day }}
        </div>
      </div>

      <!-- Calendar days -->
      <div class="calendar-grid border-t border-l border-slate-100 dark:border-slate-700">
        <!-- Previous month days (grayed out) -->
        <div 
          v-for="day in previousMonthDays" 
          :key="`prev-${day}`"
          class="calendar-day border-r border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-2 text-slate-300"
        >
          {{ day }}
        </div>

        <!-- Current month days -->
        <div 
          v-for="day in currentMonthDays" 
          :key="`current-${day}`"
          class="calendar-day border-r border-b border-slate-100 dark:border-slate-700 p-2 hover:bg-serene-beige dark:hover:bg-slate-700 transition-colors cursor-pointer group"
          :class="{ 'bg-primary/5 dark:bg-primary/10 ring-2 ring-primary ring-inset': isToday(day) }"
          @click="selectDay(day)"
        >
          <span 
            class="text-sm font-medium"
            :class="{ 'text-primary font-bold': isToday(day) || hasEvents(day) }"
          >
            {{ day }}
          </span>
          <div v-if="hasEvents(day)" class="mt-1 flex flex-col gap-1">
            <div 
              v-for="(_, idx) in getEventCount(day)"
              :key="idx"
              class="h-1 w-full bg-primary/20 rounded-full"
            ></div>
          </div>
        </div>

        <!-- Next month days (grayed out) -->
        <div 
          v-for="day in nextMonthDays" 
          :key="`next-${day}`"
          class="calendar-day border-r border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-2 text-slate-300"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { eventsData } from '../data/events'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentDate = ref(new Date()) // Start with current month/year

const monthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const previousMonthDays = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
  const prevMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 0)
  const daysInPrevMonth = prevMonth.getDate()
  return Array.from({ length: firstDay }, (_, i) => daysInPrevMonth - firstDay + i + 1)
})

const currentMonthDays = computed(() => {
  const daysInMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

const nextMonthDays = computed(() => {
  const totalCells = 42 // 6 rows × 7 days
  const filledCells = previousMonthDays.value.length + currentMonthDays.value.length
  const remainingCells = totalCells - filledCells
  return Array.from({ length: remainingCells }, (_, i) => i + 1)
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const isToday = (day: number) => {
  const today = new Date()
  return (
    day === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  )
}

const hasEvents = (day: number) => {
  return eventsData.some(event => {
    const eventDate = new Date(event.date)
    return (
      eventDate.getDate() === day &&
      eventDate.getMonth() === currentDate.value.getMonth() &&
      eventDate.getFullYear() === currentDate.value.getFullYear()
    )
  })
}

const getEventCount = (day: number) => {
  return eventsData.filter(event => {
    const eventDate = new Date(event.date)
    return (
      eventDate.getDate() === day &&
      eventDate.getMonth() === currentDate.value.getMonth() &&
      eventDate.getFullYear() === currentDate.value.getFullYear()
    )
  })
}

const selectDay = (day: number) => {
  // Could emit event or navigate to day view
  console.log(`Selected day: ${day}`)
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  aspect-ratio: 1 / 1;
  min-height: 100px;
}
</style>
