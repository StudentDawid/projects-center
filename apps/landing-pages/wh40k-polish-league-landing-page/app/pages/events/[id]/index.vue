<template>
  <v-app>
    <div class="d-flex flex-column min-vh-100 wrap-content text-text-main font-inter">
      <HeaderWidget />
      <v-main class="flex-grow-1 pa-0 bg-background-light">
        <!-- Hero Section -->
        <section class="py-12 position-relative d-flex flex-column align-center text-center">
          <v-chip class="custom-chip text-caption font-weight-bold mb-6" color="surface" variant="flat">
            <template #prepend>
              <div class="dot-indicator mr-2" />
            </template>
            {{ $t('event_page.season') }}
          </v-chip>
          
          <h1 class="text-h3 text-md-h2 font-weight-black mb-6 mt-2">{{ $t('event_page.hero_title') }}</h1>
          
          <div class="d-flex align-center flex-wrap justify-center text-body-1 font-weight-medium text-text-muted" style="gap: 16px;">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar-month-outline" color="accent" class="mr-2" size="20" />
              <span>{{ $t('event_page.date') }}</span>
            </div>
            <v-icon icon="mdi-circle-small" size="12" class="opacity-30 mx-2 d-none d-sm-block" />
            <div class="d-flex align-center">
              <v-icon icon="mdi-map-marker-outline" color="accent" class="mr-2" size="20" />
              <span>{{ $t('event_page.location_short') }}</span>
            </div>
          </div>
        </section>

        <!-- Main Content -->
        <v-container class="px-4 pb-16 pt-0" style="max-width: 1100px;">
          <v-tabs color="primary" class="mb-8 font-weight-bold" align-tabs="center">
            <v-tab :to="`/events/${route.params.id}`" exact class="text-none">{{ $t('event_page.tab_info') }}</v-tab>
            <v-tab :to="`/events/${route.params.id}/maps`" exact class="text-none">{{ $t('event_page.tab_maps') }}</v-tab>
          </v-tabs>

          <div>
            <div>
              <!-- Info & Registration Card -->
          <v-card class="bg-surface rounded-xl border border-opacity-100 mb-12" elevation="0" style="border-color: #f3f4f6 !important;">
            <v-row no-gutters>
              <!-- Info Section -->
              <v-col cols="12" md="6" class="pa-8 pa-md-10 border-b border-md-b-0 border-md-r border-opacity-100" style="border-color: #f3f4f6 !important;">
                <div class="d-flex align-center mb-8">
                  <v-icon icon="mdi-information" color="primary" class="mr-3" />
                  <h2 class="text-h6 font-weight-bold mb-0">{{ $t('event_page.info_title') }}</h2>
                </div>
                <div class="d-flex flex-wrap" style="gap: 40px;">
                  <div>
                    <div class="text-caption font-weight-bold text-primary mb-1 text-uppercase">{{ $t('event_page.points') }}</div>
                    <div class="text-h4 font-weight-black mb-1">2000</div>
                    <div class="text-caption text-text-muted">{{ $t('event_page.format_type') }}</div>
                  </div>
                  <div>
                    <div class="text-caption font-weight-bold text-primary mb-1 text-uppercase">{{ $t('event_page.capacity') }}</div>
                    <div class="text-h4 font-weight-black mb-1">64</div>
                    <div class="text-caption text-text-muted">{{ $t('event_page.players') }}</div>
                  </div>
                  <div>
                    <div class="text-caption font-weight-bold text-primary mb-1 text-uppercase">{{ $t('event_page.fee') }}</div>
                    <div class="text-h4 font-weight-black mb-1">150 PLN</div>
                    <div class="text-caption text-text-muted">{{ $t('event_page.per_person') }}</div>
                  </div>
                </div>
              </v-col>
              <!-- Registration Section -->
              <v-col cols="12" md="6" class="pa-6 pa-md-10 d-flex flex-column align-center justify-center text-center">
                <!-- Countdown -->
                <div class="d-flex justify-center mb-6 w-100 px-2 px-sm-4" style="max-width: 300px;">
                  <div class="flex-grow-1 text-center">
                    <div class="text-h4 font-weight-black">{{ timerState.days }}</div>
                    <div class="timer-label">{{ $t('event_page.days') }}</div>
                  </div>
                  <div class="text-h5 font-weight-bold mt-1">:</div>
                  <div class="flex-grow-1 text-center">
                    <div class="text-h4 font-weight-black">{{ timerState.hours }}</div>
                    <div class="timer-label">{{ $t('event_page.hours') }}</div>
                  </div>
                  <div class="text-h5 font-weight-bold mt-1">:</div>
                  <div class="flex-grow-1 text-center">
                    <div class="text-h4 font-weight-black">{{ timerState.minutes }}</div>
                    <div class="timer-label">{{ $t('event_page.minutes') }}</div>
                  </div>
                </div>
                <!-- Action Button -->
                <v-btn 
                  color="primary" 
                  size="x-large" 
                  class="text-none font-weight-bold w-100 rounded-lg elevation-4 mb-3"
                  style="letter-spacing: normal;"
                >
                  {{ $t('event_page.register_btn') }}
                </v-btn>
                <div class="text-caption text-text-muted" style="line-height: 1.2;">
                  {{ $t('event_page.registration_closes_pl') }}<br>
                  {{ $t('event_page.registration_closes_en') }}
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Main Layout -->
          <v-row spacing="48">
            <!-- Left Column (Location & Docs) -->
            <v-col cols="12" md="4" class="pr-md-6">
              <!-- Location -->
              <div class="mb-10">
                <div class="d-flex align-center mb-6">
                  <v-icon icon="mdi-map" color="accent" class="mr-3" />
                  <h2 class="text-h6 font-weight-bold mb-0">{{ $t('event_page.location_title') }}</h2>
                </div>
                <v-card class="border border-opacity-100 rounded-xl pa-6" elevation="0" style="border-color: #f3f4f6 !important;">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ $t('event_page.location_name') }}</h3>
                  <p class="text-body-2 text-text-muted mb-6">
                    {{ $t('event_page.location_address_1') }}<br>
                    {{ $t('event_page.location_address_2') }}<br>
                    {{ $t('event_page.location_address_3') }}
                  </p>
                  <!-- Map Placeholder -->
                  <div class="bg-background rounded-lg d-flex flex-column align-center justify-center py-16 px-4 text-center border border-opacity-100" style="border-color: #e5e7eb !important; min-height: 240px;">
                    <v-icon icon="mdi-map-marker" size="32" color="text-muted" class="mb-3 opacity-60" />
                    <span class="text-caption font-weight-bold text-text-muted" style="letter-spacing: 1px;">{{ $t('event_page.view_map') }}</span>
                  </div>
                </v-card>
              </div>

              <!-- Documents -->
              <div>
                <div class="d-flex align-center mb-6">
                  <v-icon icon="mdi-folder" color="accent" class="mr-3" />
                  <h2 class="text-h6 font-weight-bold mb-0">{{ $t('event_page.docs_title') }}</h2>
                </div>
                <v-card class="bg-surface rounded-lg pa-4 d-flex align-center border border-opacity-100" elevation="0" style="border-color: #f3f4f6 !important;">
                  <v-icon icon="mdi-file-pdf-box" color="primary" size="32" class="mr-4" />
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold">{{ $t('event_page.doc_name') }}</div>
                    <div class="text-caption text-text-muted">{{ $t('event_page.doc_desc') }}</div>
                  </div>
                  <v-btn icon="mdi-download" variant="text" color="text-muted" size="small" />
                </v-card>
              </div>
            </v-col>

            <!-- Right Column (Schedule) -->
            <v-col cols="12" md="8">
              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-clock-outline" color="accent" class="mr-3" />
                <h2 class="text-h6 font-weight-bold mb-0">{{ $t('event_page.schedule_title') }}</h2>
              </div>
              
              <v-card class="border border-opacity-100 rounded-xl overflow-hidden" elevation="0" style="border-color: #f3f4f6 !important;">
                <!-- Day 1 -->
                <div class="bg-background-light px-6 py-4 d-flex justify-space-between align-center border-b border-opacity-100" style="border-color: #e5e7eb !important;">
                  <h3 class="text-subtitle-2 font-weight-bold mb-0">{{ $t('event_page.day1') }}</h3>
                  <span class="text-caption text-text-muted">{{ $t('event_page.date_day1') }}</span>
                </div>
                <v-list class="pa-0">
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters align="center">
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary">09:00 - 09:30</v-col>
                      <v-col cols="8" sm="9" class="text-body-2 font-weight-medium">{{ $t('event_page.registration_briefing') }}</v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary py-1">09:30 - 12:30</v-col>
                      <v-col cols="8" sm="9">
                        <div class="text-body-2 font-weight-bold mb-1">{{ $t('event_page.round1') }}</div>
                        <div class="text-caption text-text-muted">{{ $t('event_page.mission1') }}</div>
                      </v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100 bg-background" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters align="center">
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-medium text-text-muted">12:30 - 13:30</v-col>
                      <v-col cols="8" sm="9" class="text-body-2 font-italic text-text-muted">{{ $t('event_page.lunch_break') }}</v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary py-1">13:30 - 16:30</v-col>
                      <v-col cols="8" sm="9">
                        <div class="text-body-2 font-weight-bold mb-1">{{ $t('event_page.round2') }}</div>
                        <div class="text-caption text-text-muted">{{ $t('event_page.mission2') }}</div>
                      </v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: transparent !important;">
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary py-1">16:45 - 19:45</v-col>
                      <v-col cols="8" sm="9">
                        <div class="text-body-2 font-weight-bold mb-1">{{ $t('event_page.round3') }}</div>
                        <div class="text-caption text-text-muted">{{ $t('event_page.mission3') }}</div>
                      </v-col>
                    </v-row>
                  </v-list-item>
                </v-list>

                <!-- Day 2 -->
                <div class="bg-background-light px-6 py-4 d-flex justify-space-between align-center border-y border-opacity-100" style="border-color: #e5e7eb !important;">
                  <h3 class="text-subtitle-2 font-weight-bold mb-0">{{ $t('event_page.day2') }}</h3>
                  <span class="text-caption text-text-muted">{{ $t('event_page.date_day2') }}</span>
                </div>
                <v-list class="pa-0">
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary py-1">09:00 - 12:00</v-col>
                      <v-col cols="8" sm="9">
                        <div class="text-body-2 font-weight-bold mb-1">{{ $t('event_page.round4') }}</div>
                        <div class="text-caption text-text-muted">{{ $t('event_page.mission4') }}</div>
                      </v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100 bg-background" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters align="center">
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-medium text-text-muted">12:00 - 13:00</v-col>
                      <v-col cols="8" sm="9" class="text-body-2 font-italic text-text-muted">{{ $t('event_page.lunch_break') }}</v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4 border-b border-opacity-100" style="border-color: #f3f4f6 !important;">
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary py-1">13:00 - 16:00</v-col>
                      <v-col cols="8" sm="9">
                        <div class="text-body-2 font-weight-bold mb-1">{{ $t('event_page.round5') }}</div>
                        <div class="text-caption text-text-muted">{{ $t('event_page.mission5') }}</div>
                      </v-col>
                    </v-row>
                  </v-list-item>
                  <v-list-item class="px-6 py-4" style="border-color: transparent !important;">
                    <v-row no-gutters align="center">
                      <v-col cols="4" sm="3" class="text-body-2 font-weight-bold text-primary">16:15 - 16:45</v-col>
                      <v-col cols="8" sm="9" class="text-body-2 font-weight-bold">{{ $t('event_page.awards') }}</v-col>
                    </v-row>
                  </v-list-item>
                </v-list>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import HeaderWidget from '../../../widgets/header/ui/HeaderWidget.vue';
import FooterWidget from '../../../widgets/footer/ui/FooterWidget.vue';

const route = useRoute();

// Odliczanie (docelowo do 14 września 2024, dla dema ustawię na sztywno, żeby zgadzało się wizualnie, 
// albo zrobię prosty interwał schodzący co minutę)
const timerState = ref({
  days: 12,
  hours: 4,
  minutes: 25
})

let timerInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timerState.value.minutes > 0) {
      timerState.value.minutes--
    } else {
      timerState.value.minutes = 59
      if (timerState.value.hours > 0) {
        timerState.value.hours--
      } else {
        timerState.value.hours = 23
        if (timerState.value.days > 0) {
          timerState.value.days--
        }
      }
    }
  }, 60000) // W dół co minutę dla widocznego, ale nie super-rozpraszającego efektu
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

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
</style>
