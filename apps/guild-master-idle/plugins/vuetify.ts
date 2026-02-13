import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { defineNuxtPlugin } from 'nuxt/app';

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
        defaultTheme: 'light',
        themes: {
          light: {
            colors: {
              primary: '#1e88e5',
              secondary: '#f59e0b',
              accent: '#3b82f6',
              surface: '#ffffff',
              background: '#ffffff',
            },
          },
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
        VProgressLinear: {
          rounded: true,
        },
      },
    });

    nuxtApp.vueApp.use(vuetify);
  },
});
