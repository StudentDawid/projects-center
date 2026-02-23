<template>
  <v-app>
    <div class="d-flex flex-column min-vh-100 wrap-content text-text-main">
      <HeaderWidget />
      <v-main class="flex-grow-1 pa-0 bg-background-light">
        <v-container fluid class="py-16 position-relative">
          <div
            class="mx-auto position-relative"
            style="max-width: 1280px; z-index: 1"
          >
            <div class="text-center mb-16 px-4 px-sm-6 px-lg-8">
              <v-chip
                color="primary"
                variant="flat"
                size="small"
                class="font-weight-bold mb-4 px-4 py-3 text-uppercase"
                style="letter-spacing: 0.1em"
              >
                {{ $t('nav.rules') }}
              </v-chip>
              <h1 class="text-h3 font-weight-black text-text-main mb-4">
                {{ $t('nav.rules') }}
              </h1>
            </div>

            <RulesWidget />
          </div>
        </v-container>
      </v-main>
      <FooterWidget />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import HeaderWidget from '../widgets/header/ui/HeaderWidget.vue';
import RulesWidget from '../widgets/rules/ui/RulesWidget.vue';
import FooterWidget from '../widgets/footer/ui/FooterWidget.vue';
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.wrap-content {
  overflow-x: hidden;
  background-color: #ffffff;
}
</style>
