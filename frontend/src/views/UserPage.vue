<script setup lang="ts">
import { onMounted } from "vue";
import AppFooter from "../components/AppFooter.vue";
import { RouterView, useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";
import AppHeader from "../components/AppHeader.vue";

const router = useRouter();

const jwtToken = localStorage.getItem("jwtToken");

const getUserData = async () => {
  const response = await fetch("/api/users/get/user", {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  }
};

onMounted(() => {
  getUserData();
});
</script>

<template>
  <AppHeader />
  <div class="mx-auto w-[1024px]">
    <RouterView></RouterView>
  </div>

  <AppFooter />
</template>

<style scoped></style>
