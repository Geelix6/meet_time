import { createRouter, createWebHistory } from "vue-router";
import MainPage from "./views/MainPage.vue";
import UserPage from "./views/UserPage.vue";
import CalendarView from "./views/AppCalendarView.vue";
import FriendsView from "./views/FriendsView.vue";
import SettingsView from "./views/SettingsView.vue";
import HistoryView from "./views/HistoryView.vue";

const router = createRouter({
  routes: [
    {
      path: "/",
      component: MainPage,
      beforeEnter(_, __, next) {
        const token = localStorage.getItem("jwtToken");
        if (token) {
          next({ path: "lk/calendar" });
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
      children: [
        { path: "calendar", component: CalendarView },
        { path: "friends", component: FriendsView },
        { path: "history", component: HistoryView },
        { path: "settings", component: SettingsView },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
  history: createWebHistory(),
});

export default router;
