<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.removeItem("jwtToken");
  router.push("/");
};
</script>

<template>
  <a
    @click.prevent="logout()"
    class="mx-auto my-10 block text-center text-xl underline"
    href="/"
  >
    Выйти из аккаунта
  </a>
</template>

<style scoped></style>
