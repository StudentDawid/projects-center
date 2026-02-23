<template>
  <v-app>
    <div class="d-flex flex-column min-vh-100 wrap-content text-text-main">
      <HeaderWidget />
      <v-main class="flex-grow-1 pa-0 bg-surface">
        <v-container fluid class="py-16 position-relative" id="events-list">
          <!-- WZÓR TŁA (Subtelne akcenty) -->
          <div
            class="position-absolute d-none d-md-block"
            style="
              top: -100px;
              right: -100px;
              opacity: 0.05;
              pointer-events: none;
              z-index: 0;
            "
          >
            <v-icon
              icon="mdi-bullseye-arrow"
              size="400"
              color="primary"
            ></v-icon>
          </div>

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
                {{ $t('nav.events') }}
              </v-chip>
              <h1 class="text-h3 font-weight-black text-text-main mb-4">
                {{ $t('events.title') }}
              </h1>
              <p
                class="text-h6 text-text-muted font-weight-regular mx-auto"
                style="max-width: 800px"
              >
                {{ $t('events.subtitle') }}
              </p>
            </div>

            <v-row class="px-4 px-sm-6 px-lg-8" style="row-gap: 32px">
              <!-- Event 1 -->
              <v-col cols="12" md="4" class="px-md-4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    class="d-flex flex-column h-100 overflow-hidden transition-swing border-opacity-100"
                    style="
                      border-radius: 12px;
                      border-color: #e5e7eb !important;
                    "
                    :elevation="isHovering ? 4 : 1"
                    :class="isHovering ? 'border-primary' : ''"
                    border
                    to="/events/grand_warsaw"
                  >
                    <div
                      class="bg-primary"
                      style="height: 8px; width: 100%"
                    ></div>
                    <v-card-text class="pa-6 d-flex flex-column h-100">
                      <div
                        class="d-flex align-start justify-space-between mb-4"
                      >
                        <div
                          class="px-3 py-1 bg-background rounded text-caption font-weight-bold text-grey-darken-2 text-uppercase"
                          style="letter-spacing: 0.025em"
                        >
                          14-15.09.2024
                        </div>
                        <v-icon
                          icon="mdi-trophy-variant"
                          color="accent"
                          size="24"
                        ></v-icon>
                      </div>
                      <h3
                        class="text-h6 font-weight-bold text-text-main mb-2 transition-colors"
                        :class="isHovering ? 'text-primary' : ''"
                      >
                        {{ $t('events.grand_warsaw') }}
                      </h3>
                      <div
                        class="d-flex align-center text-body-2 text-text-muted mb-6"
                        style="gap: 8px"
                      >
                        <v-icon icon="mdi-map-marker" size="18"></v-icon>
                        {{ $t('events.grand_warsaw_loc') }}
                      </div>
                      <div
                        class="mt-auto pt-4"
                        style="border-top: 1px solid #f3f4f6"
                      >
                        <div
                          class="text-primary font-weight-bold text-body-2 text-decoration-none d-flex align-center main-hover"
                        >
                          {{ $t('events.details') }}
                          <v-icon
                            icon="mdi-arrow-right"
                            size="16"
                            class="ml-1"
                          ></v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>

              <!-- Event 2 -->
              <v-col cols="12" md="4" class="px-md-4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    class="d-flex flex-column h-100 overflow-hidden transition-swing border-opacity-100"
                    style="
                      border-radius: 12px;
                      border-color: #e5e7eb !important;
                    "
                    :elevation="isHovering ? 4 : 1"
                    :class="isHovering ? 'border-primary' : ''"
                    border
                  >
                    <div
                      class="bg-accent"
                      style="height: 8px; width: 100%"
                    ></div>
                    <v-card-text class="pa-6 d-flex flex-column h-100">
                      <div
                        class="d-flex align-start justify-space-between mb-4"
                      >
                        <div
                          class="px-3 py-1 bg-background rounded text-caption font-weight-bold text-grey-darken-2 text-uppercase"
                          style="letter-spacing: 0.025em"
                        >
                          28-29.09.2024
                        </div>
                        <v-icon
                          icon="mdi-sword-cross"
                          color="grey-darken-1"
                          size="24"
                        ></v-icon>
                      </div>
                      <h3
                        class="text-h6 font-weight-bold text-text-main mb-2 transition-colors"
                        :class="isHovering ? 'text-primary' : ''"
                      >
                        {{ $t('events.silesian_open') }}
                      </h3>
                      <div
                        class="d-flex align-center text-body-2 text-text-muted mb-6"
                        style="gap: 8px"
                      >
                        <v-icon icon="mdi-map-marker" size="18"></v-icon>
                        {{ $t('events.silesian_open_loc') }}
                      </div>
                      <div
                        class="mt-auto pt-4"
                        style="border-top: 1px solid #f3f4f6"
                      >
                        <div
                          class="text-primary font-weight-bold text-body-2 text-decoration-none d-flex align-center main-hover"
                        >
                          {{ $t('events.details') }}
                          <v-icon
                            icon="mdi-arrow-right"
                            size="16"
                            class="ml-1"
                          ></v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>

              <!-- Event 3 -->
              <v-col cols="12" md="4" class="px-md-4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    class="d-flex flex-column h-100 overflow-hidden transition-swing border-opacity-100"
                    style="
                      border-radius: 12px;
                      border-color: #e5e7eb !important;
                    "
                    :elevation="isHovering ? 4 : 1"
                    :class="isHovering ? 'border-primary' : ''"
                    border
                  >
                    <div
                      class="bg-grey-darken-3"
                      style="height: 8px; width: 100%"
                    ></div>
                    <v-card-text class="pa-6 d-flex flex-column h-100">
                      <div
                        class="d-flex align-start justify-space-between mb-4"
                      >
                        <div
                          class="px-3 py-1 bg-background rounded text-caption font-weight-bold text-grey-darken-2 text-uppercase"
                          style="letter-spacing: 0.025em"
                        >
                          12-13.10.2024
                        </div>
                        <v-icon
                          icon="mdi-flag"
                          color="grey-darken-1"
                          size="24"
                        ></v-icon>
                      </div>
                      <h3
                        class="text-h6 font-weight-bold text-text-main mb-2 transition-colors"
                        :class="isHovering ? 'text-primary' : ''"
                      >
                        {{ $t('events.pomerania_cup') }}
                      </h3>
                      <div
                        class="d-flex align-center text-body-2 text-text-muted mb-6"
                        style="gap: 8px"
                      >
                        <v-icon icon="mdi-map-marker" size="18"></v-icon>
                        {{ $t('events.pomerania_cup_loc') }}
                      </div>
                      <div
                        class="mt-auto pt-4"
                        style="border-top: 1px solid #f3f4f6"
                      >
                        <div
                          class="text-primary font-weight-bold text-body-2 text-decoration-none d-flex align-center main-hover"
                        >
                          {{ $t('events.details') }}
                          <v-icon
                            icon="mdi-arrow-right"
                            size="16"
                            class="ml-1"
                          ></v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>

            <!-- Calendar Integration Section -->
            <v-container
              class="mt-16 px-4 px-sm-6 px-lg-8"
              style="max-width: 768px"
            >
              <v-card
                class="pa-8 bg-background border border-opacity-100"
                style="border-radius: 16px; border-color: #e5e7eb !important"
                elevation="0"
              >
                <v-row
                  align="center"
                  no-gutters
                  class="d-flex flex-column flex-md-row"
                  style="gap: 32px"
                >
                  <v-col cols="auto" class="d-flex justify-center">
                    <v-avatar
                      color="white"
                      size="80"
                      class="border border-opacity-100"
                      style="border-color: #f3f4f6 !important"
                      elevation="1"
                    >
                      <v-icon
                        icon="mdi-calendar-month"
                        color="primary"
                        size="36"
                      ></v-icon>
                    </v-avatar>
                  </v-col>
                  <v-col class="text-center text-md-left text-text-main">
                    <h3 class="text-h6 font-weight-bold mb-2">
                      {{ $t('events.calendar_title') }}
                    </h3>
                    <p
                      class="text-body-2 text-text-muted mb-4"
                      style="line-height: 1.5"
                    >
                      {{ $t('events.calendar_text') }}
                    </p>
                    <v-btn
                      color="primary"
                      variant="tonal"
                      class="font-weight-bold text-none px-6"
                      prepend-icon="mdi-plus"
                    >
                      Google Calendar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-container>
          </div>
        </v-container>
      </v-main>
      <FooterWidget />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import HeaderWidget from '../../widgets/header/ui/HeaderWidget.vue';
import FooterWidget from '../../widgets/footer/ui/FooterWidget.vue';
</script>

<style scoped>
.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.transition-colors {
  transition: color 0.3s ease;
}
.main-hover:hover {
  text-decoration: underline !important;
}
.border-primary {
  border-color: rgba(139, 0, 0, 0.3) !important;
}
.min-vh-100 {
  min-height: 100vh;
}
.wrap-content {
  overflow-x: hidden;
  background-color: #ffffff;
}
</style>
