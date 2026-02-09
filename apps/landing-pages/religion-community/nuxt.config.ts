import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@shared': join(__dirname, '../../../libs/shared'),
    '@features': join(__dirname, '../../../libs/features/vue'),
  },
  compatibilityDate: '2026-02-09',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  plugins: ['~/plugins/pinia-persist.ts'],
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
      title: 'Religion Community - Sacred Heart',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sacred Heart Community - Finding Peace, Purpose, and Fellowship' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/religion-community/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' },
      ],
      style: [
        {
          innerHTML: `
            :root {
              --color-primary: #135bec;
              --color-accent-gold: #C5A059;
              --color-background-light: #f6f6f8;
              --color-background-dark: #101622;
              --color-serene-beige: #F9F7F2;
            }
          `,
          type: 'text/css',
        },
      ],
      script: [
        {
          src: 'https://cdn.tailwindcss.com',
          type: 'text/javascript',
          async: false,
        },
        {
          innerHTML: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "primary": "#135bec",
                    "accent-gold": "#C5A059",
                    "background-light": "#f6f6f8",
                    "background-dark": "#101622",
                    "serene-beige": "#F9F7F2",
                  },
                  fontFamily: {
                    "display": ["Public Sans", "sans-serif"]
                  },
                  borderRadius: {
                    "DEFAULT": "0.5rem",
                    "lg": "1rem",
                    "xl": "1.5rem",
                    "full": "9999px"
                  },
                },
              },
            }
          `,
          type: 'text/javascript',
        },
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
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
  },

  css: [
    '~/assets/styles/tailwind.css',
    '~/assets/styles/main.scss',
  ],
});
