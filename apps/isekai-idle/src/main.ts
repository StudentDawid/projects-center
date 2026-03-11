import './styles.scss';
import router from './router';
import { createApp } from 'vue';
import App from './app/App.vue';
import { createPinia } from 'pinia';

// Vuetify
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(vuetify);
app.use(router);
app.mount('#root');
