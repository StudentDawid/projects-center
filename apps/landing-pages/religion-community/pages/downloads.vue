<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <section class="bg-serene-beige dark:bg-slate-900 py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto">
        <div class="w-12 h-1 bg-accent-gold mb-4"></div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Resources & Documents</h1>
        <p class="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Access our latest weekly bulletins, community guidelines, and essential forms for our parish family.
        </p>
      </div>
    </section>

    <!-- Weekly Bulletins -->
    <WeeklyBulletins />

    <!-- Community Documents -->
    <CommunityDocuments />
  </div>
</template>

<script setup lang="ts">
import WeeklyBulletins from "@features/religion-community/ui/WeeklyBulletins.vue";
import CommunityDocuments from "@features/religion-community/ui/CommunityDocuments.vue";
</script>
