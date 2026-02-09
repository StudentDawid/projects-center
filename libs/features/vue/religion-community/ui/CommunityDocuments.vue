<template>
  <section class="py-16 px-6 bg-serene-beige/50 dark:bg-slate-900/30">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold flex items-center gap-2 mb-8">
        <span class="material-symbols-outlined text-accent-gold">folder_open</span>
        Community Documents
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <ul class="divide-y divide-slate-100 dark:divide-slate-700">
          <li
            v-for="doc in documentsData"
            :key="doc.id"
            class="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="size-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined">{{ doc.icon }}</span>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {{ doc.title }}
                  </h4>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ doc.description }}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between md:justify-end gap-6">
                <span class="text-xs font-medium text-slate-400 uppercase">
                  {{ doc.size }} • {{ doc.format }}
                </span>
                <a href="#" class="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                  <span class="material-symbols-outlined text-lg">download</span>
                  Download
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { documentsData } from "../data/downloads";
</script>
