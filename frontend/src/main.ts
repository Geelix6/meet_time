import { createApp } from "vue";
import "./style.css";
import router from "./router";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";
import App from "./App.vue";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: false,
    },
  },
  locale: { firstDayOfWeek: 1 },
});
app.mount("#app");
