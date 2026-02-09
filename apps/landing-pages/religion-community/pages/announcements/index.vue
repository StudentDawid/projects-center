<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <AnnouncementsHero />
    <AnnouncementsList />
  </div>
</template>

<script setup lang="ts">
import AnnouncementsHero from '@features/religion-community/ui/AnnouncementsHero.vue'
import AnnouncementsList from '@features/religion-community/ui/AnnouncementsList.vue'
</script>

<style scoped></style>
