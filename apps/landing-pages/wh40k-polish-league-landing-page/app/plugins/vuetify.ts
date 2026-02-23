import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { defineNuxtPlugin } from 'nuxt/app';

// Theming with colors from the HTML design
const leagueTheme = {
  dark: false,
  colors: {
    background: '#f3f4f6', // background-alt
    surface: '#ffffff', // background-light
    primary: '#8b0000', // Deep red from logo
    secondary: '#660000', // Darker red for hover
    accent: '#d4af37', // Gold/Yellow from eagle
    "text-main": '#0d141b',
    "text-muted": '#4c739a',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

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
        defaultTheme: 'leagueTheme',
        themes: {
          leagueTheme,
        },
      },
      defaults: {
        VBtn: {
          variant: 'flat',
        },
        VCard: {
          elevation: 0,
          border: true,
        },
      },
    });

    nuxtApp.vueApp.use(vuetify);
  },
});
