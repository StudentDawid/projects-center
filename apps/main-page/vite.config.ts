import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: __dirname,
  base: '/projects-center/',
  cacheDir: '../../node_modules/.vite/apps/main-page',

  server: {
    port: 4200,
    host: '127.0.0.1',
    proxy: {
      '/projects-center/ateria-idle': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        ws: true,
      },
      '/projects-center/mtg-generator': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        ws: true,
      },
      '/projects-center/rpg-tools': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  build: {
    outDir: '../../dist/apps/main-page',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
