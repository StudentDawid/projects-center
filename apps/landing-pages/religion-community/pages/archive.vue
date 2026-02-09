<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <section class="bg-serene-beige dark:bg-slate-900 py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto">
        <NuxtLink to="/downloads" class="inline-flex items-center gap-2 text-primary font-bold mb-6 hover:-translate-x-1 transition-transform group">
          <span class="material-symbols-outlined text-xl">arrow_back</span>
          Back to Downloads
        </NuxtLink>
        <div class="w-12 h-1 bg-accent-gold mb-4"></div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Downloads Archive</h1>
        <p class="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse our complete collection of bulletins and documents.
        </p>
      </div>
    </section>

    <!-- Search and Filter -->
    <section class="py-8 px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-grow relative">
            <span class="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search bulletins and documents..."
              class="w-full pl-12 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="activeTab = 'all'"
              :class="[
                'px-4 py-2.5 rounded-lg font-semibold transition-all',
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
              ]"
            >
              All
            </button>
            <button
              @click="activeTab = 'bulletins'"
              :class="[
                'px-4 py-2.5 rounded-lg font-semibold transition-all',
                activeTab === 'bulletins'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
              ]"
            >
              Bulletins
            </button>
            <button
              @click="activeTab = 'documents'"
              :class="[
                'px-4 py-2.5 rounded-lg font-semibold transition-all',
                activeTab === 'documents'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
              ]"
            >
              Documents
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="flex-grow py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Bulletins Section -->
        <div v-if="(activeTab === 'all' || activeTab === 'bulletins') && filteredBulletins.length > 0" class="mb-12">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-accent-gold">newspaper</span>
            Weekly Bulletins
          </h2>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ul class="divide-y divide-slate-100 dark:divide-slate-700">
              <li
                v-for="bulletin in filteredBulletins"
                :key="bulletin.id"
                class="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="size-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center">
                      <span class="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        Weekly Bulletin
                      </h4>
                      <p class="text-sm text-slate-500 dark:text-slate-400">
                        {{ bulletin.date }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between md:justify-end gap-6">
                    <span class="text-xs font-medium text-slate-400 uppercase">PDF</span>
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

        <!-- Documents Section -->
        <div v-if="(activeTab === 'all' || activeTab === 'documents') && filteredDocuments.length > 0">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-accent-gold">folder_open</span>
            Community Documents
          </h2>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ul class="divide-y divide-slate-100 dark:divide-slate-700">
              <li
                v-for="doc in filteredDocuments"
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
                    <span class="text-xs font-medium text-slate-400 uppercase">{{ doc.size }} • {{ doc.format }}</span>
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

        <!-- No Results -->
        <div v-if="filteredBulletins.length === 0 && filteredDocuments.length === 0" class="text-center py-16">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">folder_open</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No files found</h3>
          <p class="text-slate-600 dark:text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { bulletinsData, documentsData } from "@features/religion-community/data/downloads";

const searchQuery = ref("");
const activeTab = ref<"all" | "bulletins" | "documents">("all");

const filteredBulletins = computed(() => {
  if (searchQuery.value === "") return bulletinsData;
  return bulletinsData.filter((b) => b.date.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filteredDocuments = computed(() => {
  if (searchQuery.value === "") return documentsData;
  const query = searchQuery.value.toLowerCase();
  return documentsData.filter(
    (d) => d.title.toLowerCase().includes(query) || d.description.toLowerCase().includes(query),
  );
});
</script>
