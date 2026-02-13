// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-13',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  plugins: ['~/plugins/vuetify.ts', '~/plugins/pinia-persist.ts'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  components: {
    global: true,
    dirs: ['~/components'],
  },
  ssr: false,
  devServer: {
    host: '127.0.0.1',
    port: 3006,
  },

  // GitHub Pages configuration
  nitro: {
    preset: 'github-pages',
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
        port: 4200,
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
    plugins: [
      {
        name: 'app-manifest-stub',
        resolveId(id) {
          if (id === '#app-manifest') {
            return id;
          }
          return null;
        },
        load(id) {
          if (id === '#app-manifest') {
            return 'export default {};';
          }
          return null;
        },
      },
    ],
  },
  imports: {
    autoImport: true,
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/styles/main.scss',
  ],
  build: {
    transpile: ['vuetify'],
  },
  app: {
    baseURL: '/projects-center/guild-master-idle/',
    head: {
      title: 'Guild Management - Grand Hall',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Guild Management - zarządzaj gildią bohaterów, rekrutuj nowicjuszy, buduj infrastrukturę i wysyłaj drużyny na misje!',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/projects-center/favicon.ico',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css',
        },
      ],
    },
  },
});
