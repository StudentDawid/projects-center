<template>
  <div class="article-content font-serif">
    <template v-for="(item, idx) in content" :key="idx">
      <p v-if="item.type === 'paragraph'" class="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
        {{ item.text }}
      </p>
      <blockquote 
        v-else-if="item.type === 'quote'"
        class="italic text-2xl text-primary font-bold border-l-4 border-accent-gold pl-6 my-10"
      >
        {{ item.text }}
      </blockquote>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ContentPart {
  type: 'paragraph' | 'quote'
  text: string
}

defineProps<{
  content: ContentPart[]
}>()
</script>
