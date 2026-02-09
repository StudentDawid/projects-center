<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-primary p-2 rounded-lg text-white">
          <span class="material-symbols-outlined text-2xl">church</span>
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-bold leading-tight tracking-tight">Sacred Heart</h2>
          <span class="text-[10px] uppercase tracking-[0.2em] text-accent-gold font-bold">Community</span>
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-8">
        <a class="text-sm font-semibold hover:text-primary transition-colors" href="#">Home</a>
        <a class="text-sm font-semibold hover:text-primary transition-colors" href="#">Announcements</a>
        <a class="text-sm font-semibold hover:text-primary transition-colors" href="#">About Us</a>
        <a class="text-sm font-semibold hover:text-primary transition-colors" href="#">Gallery</a>
        <a class="text-sm font-semibold hover:text-primary transition-colors" href="#">Contact</a>
      </nav>
      <button class="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-md">
        Join Us
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header component
</script>

<style scoped></style>
