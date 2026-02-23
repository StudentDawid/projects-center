<template>
  <v-container fluid class="py-16 bg-background border-y border-opacity-100" style="border-color: #f3f4f6 !important;" id="about">
    <v-row class="mx-auto px-4 px-sm-6 px-lg-8" style="max-width: 1280px;" justify="center">
      <v-col cols="12" md="6" class="d-flex flex-column" style="gap: 24px;">
        <div class="d-flex align-center mt-2" style="gap: 12px;">
          <v-icon icon="mdi-trophy" color="accent" size="36"></v-icon>
          <h2 class="text-h5 font-weight-bold text-text-main m-0">{{ $t('about.mission_title') }}</h2>
        </div>
        <v-card class="pa-8 d-flex flex-column justify-center flex-grow-1 border-opacity-100" style="border-radius: 16px; border-color: #f3f4f6 !important;" elevation="1">
          <p class="text-h6 font-weight-medium text-text-main mb-4">
            {{ $t('about.mission_subtitle') }}
          </p>
          <p class="text-body-1 text-text-muted mb-0" style="line-height: 1.625;">
            {{ $t('about.mission_text') }}
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="d-flex flex-column mt-8 mt-md-0" style="gap: 24px;">
        <div class="d-flex align-center mt-2" style="gap: 12px;">
          <v-icon icon="mdi-account-group" color="accent" size="36"></v-icon>
          <h2 class="text-h5 font-weight-bold text-text-main m-0">{{ $t('about.community_title') }}</h2>
        </div>
        <v-card class="pa-8 d-flex flex-column justify-center flex-grow-1 border-opacity-100" style="border-radius: 16px; border-color: #f3f4f6 !important;" elevation="1">
          <p class="text-h6 font-weight-medium text-text-main mb-4">
            {{ $t('about.community_subtitle') }}
          </p>
          <p class="text-body-1 text-text-muted mb-0" style="line-height: 1.625;">
            {{ $t('about.community_text') }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
