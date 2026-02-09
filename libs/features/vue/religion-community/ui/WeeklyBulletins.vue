<template>
  <section class="py-16 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-accent-gold">newspaper</span>
          Weekly Bulletins
        </h2>
        <NuxtLink to="/archive" class="text-primary text-sm font-bold hover:underline">
          Archive
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="bulletin in bulletinsData"
          :key="bulletin.id"
          class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col items-center text-center">
            <div
              class="size-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined text-4xl">picture_as_pdf</span>
            </div>
            <span
              class="text-xs font-bold uppercase tracking-wider mb-1"
              :class="bulletin.isLatest ? 'text-accent-gold' : 'text-slate-400'"
            >
              {{ bulletin.isLatest ? "Latest Issue" : "Bulletin" }}
            </span>
            <h3 class="font-bold text-lg mb-4">{{ bulletin.date }}</h3>
            <button
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors"
              :class="
                bulletin.isLatest
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              "
            >
              <span class="material-symbols-outlined text-sm">download</span>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { bulletinsData } from "../data/downloads";
</script>
