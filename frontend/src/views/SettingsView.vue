<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

const jwtToken = localStorage.getItem("jwtToken");
const router = useRouter();
const user = ref();

const firstname = ref();
const lastname = ref();
const nickname = ref();
const email = ref();

const logout = () => {
  localStorage.removeItem("jwtToken");
  router.push("/");
};

const getUser = async () => {
  const response = await fetch("/api/users/get/user", {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    return await response.json();
  }
};

onMounted(async () => {
  user.value = await getUser();

  firstname.value = user.value.firstName;
  lastname.value = user.value.lastName;
  nickname.value = user.value.username;
  email.value = user.value.email;
});

const updateUserData = async (data: string, action: string) => {
  const response = await fetch(`/api/users/set/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ newValue: data }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    user.value = await getUser();
  }
};
</script>

<template>
  <div class="relative">
    <Button
      @click.prevent="logout()"
      class="!absolute right-0 top-0 !bg-orange-500 text-xl"
      href="/"
    >
      Выйти из аккаунта
    </Button>
    <div class="mb-10 mt-4">
      <h2 class="mb-2 text-2xl">Ваши данные</h2>
      <p class="text-lg">Имя: {{ user?.firstName }}</p>
      <p class="text-lg">Фамилия: {{ user?.lastName }}</p>
      <p class="text-lg">Никнейм: {{ user?.username }}</p>
      <p class="text-lg">Почта: {{ user?.email }}</p>
    </div>

    <div class="">
      <h2 class="mb-4 text-2xl">Изменить свои данные</h2>
      <div class="mb-2 flex gap-x-4">
        <p class="w-40 text-lg">Имя:</p>
        <InputText
          autocomplete="off"
          type="text"
          v-model:model-value="firstname"
          class="w-56"
        />
        <Button
          @click="() => updateUserData(firstname, 'firstname')"
          class="text-xl"
          >Изменить
        </Button>
      </div>

      <div class="mb-2 flex gap-x-4">
        <p class="w-40 text-lg">Фамилия:</p>
        <InputText
          autocomplete="off"
          type="text"
          v-model:model-value="lastname"
          class="w-56"
        />
        <Button
          @click="() => updateUserData(lastname, 'lastname')"
          class="text-xl"
          >Изменить
        </Button>
      </div>
      <!-- <div class="mb-2 flex gap-x-4">
        <p class="w-40 text-lg">Никнейм:</p>
        <InputText
          autocomplete="off"
          type="text"
          v-model:model-value="nickname"
          class="w-56"
        />
        <Button
          @click="() => updateUserData(nickname, 'nickname')"
          class="text-xl"
          >Изменить
        </Button>
      </div> -->
      <div class="mb-2 flex gap-x-4">
        <p class="w-40 text-lg">Email:</p>
        <InputText
          autocomplete="off"
          type="text"
          v-model:model-value="email"
          class="w-56"
        />
        <Button @click="() => updateUserData(email, 'email')" class="text-xl"
          >Изменить
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
