import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@shared': join(__dirname, '../../../libs/shared'),
  },
  compatibilityDate: '2026-02-09',
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
    port: 3005,
  },

  app: {
    baseURL: '/religion-community/',
    head: {
      title: 'Religion Community',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Religion Community Landing Page' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/religion-community/favicon.ico' }
      ],
    },
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
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
  },

  css: [
    '@mdi/font/css/materialdesignicons.css',
    'vuetify/styles',
    '~/assets/styles/main.scss',
  ],

  build: {
    transpile: ['vuetify'],
  },
});
