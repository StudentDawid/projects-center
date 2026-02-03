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
        defaultTheme: 'dark',
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
