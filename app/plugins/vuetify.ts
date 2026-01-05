import { createVuetify, type ThemeDefinition } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { defineNuxtPlugin } from 'nuxt/app';

// Motyw: Teokracja Solmara - Sakralny Brutalizm
const solmarTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#1c1a16', // Ciemny brąz/czarny
    surface: '#2b2720', // Okopcony kamień
    'surface-variant': '#3d3830',
    'on-surface-variant': '#c5a059',
    primary: '#c5a059', // Zgaszone złoto
    'primary-darken-1': '#9a7a3d',
    secondary: '#8b7355', // Zardzewiały metal
    'secondary-darken-1': '#6b5a45',
    error: '#8a2be2', // Liturgiczna purpura
    info: '#4a6fa5',
    success: '#6b8e23', // Oliwkowy
    warning: '#cd853f', // Peru/rdzawy
    'on-background': '#d4c4a8',
    'on-surface': '#d4c4a8',
    'on-primary': '#1c1a16',
    'on-secondary': '#1c1a16',
    'on-error': '#ffffff',
  },
  variables: {
    'border-color': '#c5a059',
    'border-opacity': 0.3,
    'high-emphasis-opacity': 0.95,
    'medium-emphasis-opacity': 0.7,
    'disabled-opacity': 0.4,
    'hover-opacity': 0.1,
    'focus-opacity': 0.15,
    'pressed-opacity': 0.2,
  },
};

// Motyw: Kultyści Mięsa - Organiczny Horror
const cultTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#1a0505', // Zakrzepła krew
    surface: '#2d0a0a', // Surowe mięso
    'surface-variant': '#3d1515',
    'on-surface-variant': '#ff4040',
    primary: '#ff4040', // Tętnicza krew
    'primary-darken-1': '#cc2020',
    secondary: '#a8a878', // Kość/Ropa
    'secondary-darken-1': '#8a8a60',
    error: '#ff6b6b',
    info: '#6b8e8e',
    success: '#8fbc8f', // Zarażony zielony
    warning: '#daa520', // Zainfekowany żółty
    'on-background': '#e8d0d0',
    'on-surface': '#e8d0d0',
    'on-primary': '#1a0505',
    'on-secondary': '#1a0505',
    'on-error': '#1a0505',
  },
  variables: {
    'border-color': '#ff4040',
    'border-opacity': 0.4,
    'high-emphasis-opacity': 0.95,
    'medium-emphasis-opacity': 0.7,
    'disabled-opacity': 0.4,
    'hover-opacity': 0.15,
    'focus-opacity': 0.2,
    'pressed-opacity': 0.25,
  },
};

export default defineNuxtPlugin({
  name: 'vuetify',
  setup(nuxtApp) {
    const vuetify = createVuetify({
      components,
      directives,
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
      theme: {
        defaultTheme: 'solmar',
        themes: {
          solmar: solmarTheme,
          cult: cultTheme,
        },
      },
      defaults: {
        VBtn: {
          variant: 'flat',
          rounded: 0,
          class: 'text-uppercase font-weight-bold',
        },
        VCard: {
          rounded: 0,
          elevation: 0,
          border: true,
        },
        VProgressLinear: {
          rounded: 0,
          height: 8,
        },
      },
    });

    nuxtApp.vueApp.use(vuetify);
  },
});
