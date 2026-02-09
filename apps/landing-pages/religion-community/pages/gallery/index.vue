<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <section class="bg-serene-beige dark:bg-background-dark/30 py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto text-center">
        <div class="w-16 h-1 bg-accent-gold mx-auto mb-6"></div>
        <h1 class="text-4xl md:text-5xl font-black mb-4">Community Gallery: Moments of Fellowship</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Capturing the essence of our journey together through worship, service, and celebration.
        </p>
      </div>
    </section>

    <!-- All Galleries -->
    <AllGalleries />

    <!-- Newsletter CTA -->
    <section class="py-20 px-6 bg-serene-beige dark:bg-slate-800/30">
      <div class="max-w-4xl mx-auto text-center">
        <h3 class="text-2xl font-bold mb-4">Want to see more?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-8">
          Subscribe to our newsletter to get monthly updates and photo highlights from our recent events.
        </p>
        <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            class="flex-grow rounded-xl border-slate-200 focus:ring-primary focus:border-primary px-4 py-3 dark:bg-background-dark dark:border-slate-700"
          />
          <button
            type="submit"
            class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AllGalleries from "@features/religion-community/ui/AllGalleries.vue";
</script>
