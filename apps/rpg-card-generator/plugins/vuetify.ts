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
              primary: '#4F46E5',   // Fioletowo-niebieski ze screena
              secondary: '#64748B', // Slates do wygaszonych akcji
              surface: '#FFFFFF',
              background: '#F8FAFC',
              'surface-variant': '#F1F5F9', // tło jasne dla paneli lewo/prawo
              error: '#EF4444',
            },
          },
        },
      },
      defaults: {
        VBtn: {
          variant: 'flat',
          class: 'text-none font-weight-medium rounded-lg',
        },
        VCard: {
          elevation: 0,
        },
        VTextField: {
          variant: 'outlined',
          density: 'compact',
          hideDetails: true,
          color: 'primary',
          bgColor: 'white'
        },
        VSelect: {
          variant: 'outlined',
          density: 'compact',
          hideDetails: true,
          color: 'primary',
          bgColor: 'white'
        }
      },
    });

    nuxtApp.vueApp.use(vuetify);
  },
});
