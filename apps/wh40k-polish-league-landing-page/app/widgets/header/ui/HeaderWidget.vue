<template>
  <v-app-bar color="white" elevation="0" class="border-b border-opacity-100" style="border-bottom-color: #f3f4f6 !important;" height="80">
    <template #prepend>
      <div class="d-flex align-center ml-2 ml-sm-4">
        <v-img
          alt="PLW 40k Logo"
          :src="logoImage"
          height="56"
          width="140"
          contain
        ></v-img>
      </div>
    </template>

    <div class="d-none d-md-flex align-center mx-auto" style="gap: 32px">
      <v-btn variant="text" color="text-main" class="text-none font-weight-medium text-body-2 hover-link" href="#about" :ripple="false">
        {{ $t('nav.about') }}
      </v-btn>
      <v-btn variant="text" color="text-main" class="text-none font-weight-medium text-body-2 hover-link" href="#events" :ripple="false">
        {{ $t('nav.events') }}
      </v-btn>
      <v-btn variant="text" color="text-main" class="text-none font-weight-medium text-body-2 hover-link" href="#resources" :ripple="false">
        {{ $t('nav.resources') }}
      </v-btn>
      <v-btn variant="text" color="text-main" class="text-none font-weight-medium text-body-2 hover-link" href="#rules" :ripple="false">
        {{ $t('nav.rules') }}
      </v-btn>
    </div>

    <v-spacer class="d-md-none"></v-spacer>

    <template #append>
      <div class="d-flex align-center mr-2 mr-sm-4" style="gap: 16px">
        <v-btn
          color="background"
          variant="flat"
          height="36"
          class="text-none font-weight-bold text-caption text-text-main rounded-lg border border-opacity-100 hover-btn"
          style="border-color: transparent !important;"
          @click="toggleLanguage"
        >
          {{ locale === 'pl' ? 'EN' : 'PL' }}
        </v-btn>
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn icon="mdi-menu" variant="text" class="d-md-none" color="text-main" v-bind="props"></v-btn>
          </template>
          <v-list class="mt-2" elevation="2" rounded="lg">
            <v-list-item href="#about" class="text-text-main font-weight-medium text-body-2">
              <v-list-item-title>{{ $t('nav.about') }}</v-list-item-title>
            </v-list-item>
            <v-list-item href="#events" class="text-text-main font-weight-medium text-body-2">
              <v-list-item-title>{{ $t('nav.events') }}</v-list-item-title>
            </v-list-item>
            <v-list-item href="#resources" class="text-text-main font-weight-medium text-body-2">
              <v-list-item-title>{{ $t('nav.resources') }}</v-list-item-title>
            </v-list-item>
            <v-list-item href="#rules" class="text-text-main font-weight-medium text-body-2">
              <v-list-item-title>{{ $t('nav.rules') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'
import logoImage from '~/assets/ligalogo.png'

const { locale, setLocale } = useI18n()

const toggleLanguage = () => {
  setLocale(locale.value === 'pl' ? 'en' : 'pl')
}
</script>

<style scoped>
.hover-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: transparent !important;
}
.hover-btn:hover {
  background-color: rgba(139, 0, 0, 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-color: rgba(139, 0, 0, 0.2) !important;
}
</style>
