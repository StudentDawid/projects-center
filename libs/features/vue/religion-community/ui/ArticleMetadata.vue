<template>
  <div>
    <!-- Breadcrumb Navigation -->
    <nav class="flex text-xs font-bold uppercase tracking-widest text-slate-400 gap-2 items-center mb-12">
      <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <NuxtLink to="/announcements" class="hover:text-primary transition-colors">Announcements</NuxtLink>
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <span class="text-accent-gold">{{ title }}</span>
    </nav>

    <!-- Share Section -->
    <div class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
      <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm">
        Share this announcement
      </h4>
      <div class="flex gap-4">
        <!-- Facebook -->
        <button 
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-bold"
          @click="shareOnSocial('facebook')"
        >
          <svg class="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
          </svg>
          Facebook
        </button>
        
        <!-- Twitter -->
        <button 
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-bold"
          @click="shareOnSocial('twitter')"
        >
          <svg class="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
          </svg>
          Twitter
        </button>

        <!-- Copy Link -->
        <button 
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-bold"
          @click="copyLink"
        >
          <span class="material-symbols-outlined text-lg">link</span>
          {{ copied ? 'Copied!' : 'Copy Link' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
}>()

const copied = ref(false)

const shareOnSocial = (platform: string) => {
  const url = window.location.href
  const text = 'Check out this announcement'

  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
