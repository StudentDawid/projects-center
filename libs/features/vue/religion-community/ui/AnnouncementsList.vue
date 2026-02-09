<template>
  <section class="py-20 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search announcements..." 
            class="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select 
          v-model="selectedCategory" 
          class="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          <option value="events">Events</option>
          <option value="outreach">Outreach</option>
          <option value="spiritual">Spiritual</option>
          <option value="updates">Updates</option>
        </select>
        <select 
          v-model="sortBy" 
          class="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <!-- Announcements Grid -->
      <div v-if="filteredAnnouncements.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnnouncementCard 
          v-for="announcement in filteredAnnouncements" 
          :key="announcement.id"
          :id="announcement.id"
          :img="announcement.image"
          :tag="announcement.tag"
          :date="announcement.date"
          :title="announcement.title"
          :excerpt="announcement.excerpt"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-2xl font-bold mb-2">No announcements found</h3>
        <p class="text-slate-600 dark:text-slate-400">Try adjusting your filters or search query.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AnnouncementCard from './cards/AnnouncementCard.vue'
import { articlesData } from '../data/articles'

const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')

const filteredAnnouncements = computed(() => {
  let result = articlesData.slice()

  if (searchQuery.value) {
    result = result.filter(a => 
      a.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    result = result.filter(a => a.category.toLowerCase() === selectedCategory.value.toLowerCase())
  }

  if (sortBy.value === 'oldest') {
    result.reverse()
  }

  return result
})
</script>

<style scoped></style>
