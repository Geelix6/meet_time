<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppFooter from "../components/AppFooter.vue";
import { useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";

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

const logout = () => {
  localStorage.removeItem("jwtToken");
  router.push("/");
};

onMounted(() => {
  getUserData();
});
</script>

<template>
  <div class="ml-32">
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
  </div>

  <a
    @click.prevent="logout()"
    class="mx-auto my-10 block text-center text-xl underline"
    href="../"
    >Выйти из аккаунта</a
  >
  <AppFooter />
</template>

<style scoped></style>
