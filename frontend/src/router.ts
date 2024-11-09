import { createRouter, createWebHistory } from "vue-router";
import MainPage from "./views/MainPage.vue";
import UserPage from "./views/UserPage.vue";

const router = createRouter({
  routes: [
    {
      path: "/",
      component: MainPage,
      beforeEnter(_, __, next) {
        const token = localStorage.getItem("jwtToken");
        if (token) {
          next({ path: "lk" });
        } else {
          next();
        }
      },
    },
    {
      path: "/lk",
      component: UserPage,
      beforeEnter(_, __, next) {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          next({ name: "" });
        } else {
          next();
        }
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
  history: createWebHistory(),
});

export default router;
