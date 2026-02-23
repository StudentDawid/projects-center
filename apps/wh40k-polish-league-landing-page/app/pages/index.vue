<template>
  <v-app>
    <div class="d-flex flex-column min-vh-100 wrap-content text-text-main">
      <HeaderWidget />
      <v-main class="flex-grow-1 pa-0 bg-background-light">
        <HeroWidget />
        <AboutWidget />
        <EventsWidget />
        <ResourcesWidget />
        <RulesWidget />
      </v-main>
      <FooterWidget />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import HeaderWidget from '../widgets/header/ui/HeaderWidget.vue';
import HeroWidget from '../widgets/hero/ui/HeroWidget.vue';
import AboutWidget from '../widgets/about/ui/AboutWidget.vue';
import EventsWidget from '../widgets/events/ui/EventsWidget.vue';
import ResourcesWidget from '../widgets/resources/ui/ResourcesWidget.vue';
import RulesWidget from '../widgets/rules/ui/RulesWidget.vue';
import FooterWidget from '../widgets/footer/ui/FooterWidget.vue';
</script>

<style>
/* Global resets for pure Vuetify experience without Tailwind */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Inter', sans-serif !important;
  scroll-behavior: smooth;
  background-color: #ffffff;
}

.wrap-content {
  overflow-x: hidden;
  background-color: #ffffff;
}

.min-vh-100 {
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Force Vuetify typography to override Roboto */
.v-application {
  font-family: 'Inter', sans-serif !important;
}
.text-h1,
.text-h2,
.text-h3,
.text-h4,
.text-h5,
.text-h6,
.text-subtitle-1,
.text-subtitle-2,
.text-body-1,
.text-body-2,
.text-button,
.text-caption,
.text-overline {
  font-family: 'Inter', sans-serif !important;
}
</style>
