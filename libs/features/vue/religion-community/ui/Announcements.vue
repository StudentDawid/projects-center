<template>
  <section class="py-20 px-6 bg-serene-beige dark:bg-background-dark/50">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <div class="w-12 h-1 bg-accent-gold mb-4"></div>
          <h2 class="text-3xl md:text-4xl font-black">Latest Announcements</h2>
        </div>
        <a class="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all" href="#">View All <span class="material-symbols-outlined">arrow_forward</span></a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Announcements container - cards provided via slots or child components
</script>

<style scoped></style>
