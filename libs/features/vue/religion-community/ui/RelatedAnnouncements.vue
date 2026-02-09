<template>
  <section class="bg-serene-beige dark:bg-background-dark/50 py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-2xl font-black">Related Announcements</h2>
        <NuxtLink 
          to="/announcements"
          class="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group"
        >
          See All Announcements 
          <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NuxtLink 
          v-for="article in relatedArticles"
          :key="article.id"
          :to="`/announcements/${article.id}`"
          class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 group flex flex-col h-full"
        >
          <div class="h-40 overflow-hidden relative">
            <img 
              :src="article.image"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div class="p-6 flex flex-col flex-grow">
            <span class="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] mb-2">
              {{ article.tag }}
            </span>
            <h3 class="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {{ article.title }}
            </h3>
            <button class="mt-auto text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
              Read More 
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { articlesData } from '../data/articles'

const route = useRoute()

const relatedArticles = computed(() => {
  const currentId = parseInt(route.params.id as string)
  return articlesData
    .filter(article => article.id !== currentId)
    .slice(0, 2)
})
</script>
