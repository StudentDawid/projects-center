<template>
  <v-app>
    <div
      class="d-flex flex-column min-vh-100 wrap-content text-text-main font-inter"
    >
      <HeaderWidget />
      <v-main class="flex-grow-1 pa-0 bg-background-light">
        <!-- Hero Section -->
        <section
          class="py-12 position-relative d-flex flex-column align-center text-center"
        >
          <v-chip
            class="custom-chip text-caption font-weight-bold mb-6"
            color="surface"
            variant="flat"
          >
            <template #prepend>
              <div class="dot-indicator mr-2" />
            </template>
            {{ $t('event_page.season') }}
          </v-chip>

          <h1 class="text-h3 text-md-h2 font-weight-black mb-6 mt-2">
            {{ $t('event_page.hero_title') }}
          </h1>

          <div
            class="d-flex align-center flex-wrap justify-center text-body-1 font-weight-medium text-text-muted"
            style="gap: 16px"
          >
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-calendar-month-outline"
                color="accent"
                class="mr-2"
                size="20"
              />
              <span>{{ $t('event_page.date') }}</span>
            </div>
            <v-icon
              icon="mdi-circle-small"
              size="12"
              class="opacity-30 mx-2 d-none d-sm-block"
            />
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-map-marker-outline"
                color="accent"
                class="mr-2"
                size="20"
              />
              <span>{{ $t('event_page.location_short') }}</span>
            </div>
          </div>
        </section>

        <!-- Main Content -->
        <v-container class="px-4 pb-16 pt-0" style="max-width: 1100px">
          <v-tabs
            color="primary"
            class="mb-8 font-weight-bold"
            align-tabs="center"
          >
            <v-tab :to="`/events/${route.params.id}`" exact class="text-none">{{
              $t('event_page.tab_info')
            }}</v-tab>
            <v-tab
              :to="`/events/${route.params.id}/maps`"
              exact
              class="text-none"
              >{{ $t('event_page.tab_maps') }}</v-tab
            >
          </v-tabs>

          <div>
            <div>
              <v-row justify="center">
                <!-- Map Images -->
                <v-col v-for="i in 5" :key="i" cols="12" md="10" lg="8">
                  <v-card
                    class="rounded-xl border border-opacity-100 overflow-hidden mb-8"
                    elevation="0"
                    style="border-color: #f3f4f6 !important"
                  >
                    <div
                      class="pa-4 bg-surface border-b pb-3 font-weight-bold text-center"
                      style="border-color: #f3f4f6 !important"
                    >
                      {{ $t(`event_page.map_${i}`) }}
                    </div>
                    <div style="aspect-ratio: 16 / 9; width: 100%">
                      <v-img
                        :src="getMapImage(i)"
                        class="w-100 h-100 bg-background-light"
                        eager
                      >
                        <template #placeholder>
                          <v-skeleton-loader
                            type="image"
                            class="w-100 h-100 custom-skeleton"
                          ></v-skeleton-loader>
                        </template>
                      </v-img>
                    </div>
                  </v-card>
                </v-col>

                <!-- QR Code Placeholder -->
                <v-col cols="12" md="10" lg="8">
                  <v-card
                    class="rounded-xl border border-opacity-100 overflow-hidden bg-surface pa-8 text-center"
                    elevation="0"
                    style="border-color: #f3f4f6 !important"
                  >
                    <h3 class="text-h6 font-weight-bold mb-4">
                      {{ $t('event_page.qr_title') }}
                    </h3>
                    <div class="d-flex justify-center mb-4">
                      <div
                        class="bg-background-light rounded-lg d-flex align-center justify-center border border-opacity-100 pa-4"
                        style="border-color: #e5e7eb !important"
                      >
                        <qrcode-vue
                          v-if="pageUrl"
                          :value="pageUrl"
                          :size="200"
                          level="H"
                        />
                      </div>
                    </div>
                    <p class="text-body-2 text-text-muted">
                      {{ $t('event_page.qr_desc') }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-container>
      </v-main>
      <FooterWidget />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import QrcodeVue from 'qrcode.vue';
import HeaderWidget from '../../../widgets/header/ui/HeaderWidget.vue';
import FooterWidget from '../../../widgets/footer/ui/FooterWidget.vue';

const route = useRoute();
const pageUrl = ref('');

onMounted(() => {
  if (typeof window !== 'undefined') {
    pageUrl.value = window.location.href;
  }
});

// Dynamic image loading for Vite
const mapImages: Record<string, string> = import.meta.glob(
  '~/assets/img/test-map-img/*.png',
  { eager: true, import: 'default' }
);

const getMapImage = (index: number): string => {
  // import.meta.glob usually returns absolute paths from project root depending on alias configuration
  // Let's find the matching key by suffix
  const key = Object.keys(mapImages).find((k) => k.endsWith(`/${index}.png`));
  return (key ? mapImages[key] : '') as string;
};
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif !important;
}

.custom-chip {
  background-color: #fce7eb !important; /* light red tint */
  color: #a33240 !important; /* darker red text */
  border-radius: 100px;
  height: 28px;
  padding: 0 16px;
  letter-spacing: 0.5px;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #a33240;
}

.timer-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

:deep(.custom-skeleton .v-skeleton-loader__image) {
  height: 100% !important;
  border-radius: 0;
}
</style>
