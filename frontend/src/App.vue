<template>
  <form @submit.prevent="userRegister">
    <h2>Зарегестрироваться</h2>
    <input type="text" v-model="login" />
    <input type="text" v-model="password" />
    <button type="submit">Зарегестрироваться</button>
  </form>
</template>

<script setup>
import { ref } from "vue";

const login = ref("");
const password = ref("");

const userRegister = async () => {
  console.log(JSON.stringify({ login: login.value, password: password.value }));
  let result = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ login: login.value, password: password.value }),
  });

  let text = await result.json();
  console.log(text);
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}
</style>
