<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppFooter from "../components/AppFooter.vue";
import { RouterView, useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";
import AppHeader from "../components/AppHeader.vue";

const router = useRouter();

const jwtToken = localStorage.getItem("jwtToken");
const whoami: any = ref({});
const users: any = ref({});

const getUserData = async () => {
  const response = await fetch("/api/users/get/user", {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    const data = await response.json();
    whoami.value = data;
  }
};

const getAllUsersData = async () => {
  const response = await fetch("/api/users/get/users", {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    const data = await response.json();
    users.value = data;
  }
};

onMounted(() => {
  getUserData();
});
</script>

<template>
  <AppHeader />
  <div class="mx-auto max-w-screen-lg">
    <RouterView></RouterView>
    <!-- <div>
    <p class="mt-4 text-3xl">Привет, {{ whoami.firstName }}!</p>
      <p>Ваши данные</p>
      <pre class="">{{ whoami }}</pre>
      <button
        @click="getAllUsersData()"
        class="divide-solid rounded-lg border-2 border-cyan-200 p-2"
      >
        получить список всех пользователей (нужна авторизация (валидный jwt))
      </button>
      <pre class="">{{ users }}</pre>
    </div> -->
  </div>

  <AppFooter />
</template>

<style scoped></style>
