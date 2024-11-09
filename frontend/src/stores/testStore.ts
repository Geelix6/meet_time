import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestStore = defineStore("testStore", () => {
  const testData = ref(1);

  function add() {
    testData.value += 1;
  }

  return { testData, add };
});
