// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-03',
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
  ssr: false, // Disable SSR for game (localStorage, requestAnimationFrame)

  // GitHub Pages configuration
  nitro: {
    preset: 'github-pages',
  },

  vite: {
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
    dirs: ['../../libs/shared/lib', '../../libs/shared/types'],
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
    // Base URL for GitHub Pages (repository name)
    baseURL: '/projects-center/',
    head: {
      title: 'Projects Center',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Centrum projektów - kolekcja gier, eksperymentów i pomysłów',
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
