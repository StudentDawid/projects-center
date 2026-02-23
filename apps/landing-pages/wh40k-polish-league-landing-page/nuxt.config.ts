import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../../',
  devtools: { enabled: true },
  devServer: {
    host: '127.0.0.1',
    port: 3005,
  },
  typescript: {
    tsConfig: {
      extends: '../../../../tsconfig.base.json',
      compilerOptions: {
        baseUrl: '.',
      },
    },
  },
  alias: {
    '@shared/lib/gddb': '../../../libs/shared/gddb/index.ts',
  },
  imports: {
    autoImport: true,
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.css',
  ],
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'pl', file: 'pl.json', name: 'Polski' },
      { code: 'en', file: 'en.json', name: 'English' },
    ],
    langDir: 'locales',
    defaultLocale: 'pl',
    lazy: true,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  plugins: ['~/plugins/vuetify.ts', '~/plugins/pinia-persist.ts'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
        port: 4200,
      },
    },
    plugins: [nxViteTsPaths()],
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  app: {
    baseURL: '/projects-center/wh40k-polish-league-landing-page/',
    head: {
      title: 'WH40k Polish League',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css',
        },
      ],
    },
  },
});
