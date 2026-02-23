<template>
  <v-container fluid class="py-16 py-lg-32 text-center position-relative d-flex flex-column align-center justify-center overflow-hidden" style="min-height: max(500px, calc(100vh - 80px));">
    <!-- Abstract topographic map pattern -->
    <div 
      class="position-absolute w-100 h-100 opacity-40" 
      style="top: 0; left: 0; pointer-events: none; z-index: 0; background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 32px 32px;"
    ></div>

    <v-row class="position-relative w-100 mx-0" style="z-index: 1; max-width: 896px;" justify="center" align="center">
      <v-col cols="12" class="d-flex flex-column align-center px-4" style="gap: 32px;">
        <!-- Season Badge -->
        <div class="d-inline-flex align-center px-3 py-1 font-weight-bold text-uppercase" style="background-color: rgba(139, 0, 0, 0.1); color: rgb(var(--v-theme-primary)); font-size: 0.75rem; letter-spacing: 0.05em; gap: 8px; border-radius: 9999px;">
          <div class="rounded-circle bg-primary" style="width: 8px; height: 8px; animation: pulse 2s infinite;"></div>
          {{ $t('hero.season') }}
        </div>

        <!-- Main Title -->
        <h1 class="text-h4 text-md-h2 font-weight-black text-text-main" style="line-height: 1.1; letter-spacing: -0.025em;">
          {{ $t('hero.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="text-h6 text-md-h5 text-text-muted font-weight-light" style="max-width: 672px; line-height: 1.5;">
          {{ $t('hero.subtitle') }}
        </p>

        <!-- CTA Buttons -->
        <div class="d-flex flex-column flex-sm-row justify-center mt-4 w-100" style="gap: 16px;">
          <v-btn
            color="primary"
            height="48"
            class="px-8 text-none font-weight-bold text-white transition-all btn-primary-hover"
            href="#events"
            elevation="0"
            style="border-radius: 8px;"
          >
            {{ $t('hero.cta_calendar') }}
          </v-btn>
          <v-btn
            color="white"
            variant="flat"
            height="48"
            class="px-8 text-none font-weight-medium text-text-main border transition-all btn-sec-hover border-opacity-100"
            href="#about"
            style="border-radius: 8px; border-color: #e5e7eb !important;"
          >
            {{ $t('hero.cta_learn') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
}

.btn-primary-hover:hover {
  background-color: #660000 !important;
  box-shadow: 0 10px 15px -3px rgba(139, 0, 0, 0.3), 0 4px 6px -4px rgba(139, 0, 0, 0.3) !important;
}
.btn-sec-hover:hover {
  background-color: #f9fafb !important;
  border-color: #d1d5db !important;
}
</style>
