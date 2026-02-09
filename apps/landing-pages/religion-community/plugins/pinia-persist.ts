/**
 * Pinia Persistence Plugin
 * Enables automatic localStorage saving for application state
 */
import { defineNuxtPlugin } from 'nuxt/app';
import type { Pinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin({
  name: 'pinia-persist',
  setup({ $pinia }) {
    ($pinia as Pinia).use(piniaPluginPersistedstate);
  },
});
