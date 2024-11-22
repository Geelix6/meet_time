import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("testStore", () => {
  const userId = ref("");

  function setUserId(newUserId: string) {
    userId.value = newUserId;
  }

  return { userId, setUserId };
});
