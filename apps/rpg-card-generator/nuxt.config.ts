import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  alias: {
    '@rpg-card-generator': join(__dirname, './'),
    '@shared': join(__dirname, '../../libs/shared'),
  },
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
  ssr: false,
  devServer: {
    host: '127.0.0.1',
    port: 3004,
  },

  nitro: {
    preset: 'github-pages',
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
        port: 4204,
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
          if (id === '#app-manifest') return id;
          return null;
        },
        load(id) {
          if (id === '#app-manifest') return 'export default {};';
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
    baseURL: '/projects-center/rpg-card-generator/',
    head: {
      title: 'RPG Card Generator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Generator kart RPG — twórz własne karty umiejętności, lokacji, zadań i więcej.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/projects-center/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=MedievalSharp&family=Roboto:wght@300;400;500;700&display=swap',
        }
      ],
    },
  },
});
