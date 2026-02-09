<template>
  <div v-if="article" class="max-w-4xl mx-auto px-6 py-8">
    <ArticleMetadata :title="article.title" />
    <article>
      <ArticleHero 
        :title="article.title"
        :tag="article.tag"
        :date="article.date"
        :image="article.image"
      />
      <ArticleContent :content="article.content" />
    </article>
    <RelatedAnnouncements />
  </div>
  <div v-else class="max-w-4xl mx-auto px-6 py-20 text-center">
    <h1 class="text-4xl font-bold mb-4">Article not found</h1>
    <p class="text-slate-600 dark:text-slate-300 mb-8">The article you're looking for doesn't exist.</p>
    <NuxtLink 
      to="/announcements"
      class="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all"
    >
      Back to Announcements
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ArticleMetadata from '@features/religion-community/ui/ArticleMetadata.vue'
import ArticleHero from '@features/religion-community/ui/ArticleHero.vue'
import ArticleContent from '@features/religion-community/ui/ArticleContent.vue'
import RelatedAnnouncements from '@features/religion-community/ui/RelatedAnnouncements.vue'
import { articlesData } from '@features/religion-community/data/articles'

const route = useRoute()

const article = computed(() => {
  const id = parseInt(route.params.id as string)
  return articlesData.find(a => a.id === id)
})

// Set page metadata
useHead({
  title: article.value ? `${article.value.title} - Sacred Heart Community` : 'Article - Sacred Heart Community'
})
</script>
