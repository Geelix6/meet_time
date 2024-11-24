<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import Popover from "primevue/popover";
import { onMounted, ref } from "vue";
import { forceLogout } from "../utils/forceLogout";
import { Button } from "primevue";

const jwtToken = localStorage.getItem("jwtToken");
const router = useRouter();

const op = ref();
const notifs = ref();
const countNotifs = ref();

const toggle = async (event: any) => {
  op.value.toggle(event);
  notifs.value = await getNotifs();
};

const getNotifs = async () => {
  const response = await fetch("/api/users/get/notif", {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    const resp = await response.json();
    countNotifs.value = resp.filter((e: { isRead: any }) => !e.isRead).length;
    return resp;
  }
};

const readNotif = async (id: string) => {
  const response = await fetch("/api/users/set/notif", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ notifId: id }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    notifs.value = await getNotifs();
  }
};

const deleteNotif = async (id: string) => {
  const response = await fetch("/api/users/delete/notif", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ notifId: id }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    notifs.value = await getNotifs();
  }
};
// @ts-ignore
const deleteAllNotif = async () => {
  notifs.value?.forEach((e: { id: string }) => deleteNotif(e.id));
};

onMounted(async () => {
  notifs.value = await getNotifs();

  setInterval(async () => (notifs.value = await getNotifs()), 5000);
});
</script>

<template>
  <header class="bg-black py-4 text-white">
    <div class="mx-auto flex max-w-screen-lg items-center justify-between">
      <span class="text-xl font-black">Meet&Time</span>
      <nav class="flex items-center gap-x-10">
        <RouterLink to="./calendar" class="transition-opacity hover:opacity-80">
          Календарь
        </RouterLink>
        <RouterLink to="./friends" class="transition-opacity hover:opacity-80">
          Друзья
        </RouterLink>
        <RouterLink to="./history" class="transition-opacity hover:opacity-80">
          История
        </RouterLink>
      </nav>
      <div class="relative flex items-center gap-x-8">
        <span v-if="countNotifs > 0" id="indicator"></span>
        <i
          @click="(e) => toggle(e)"
          class="pi pi-bell cursor-pointer transition-opacity hover:opacity-80"
        ></i>
        <RouterLink
          id="settings"
          to="./settings"
          class="transition-opacity hover:opacity-80"
        >
          <i class="pi pi-cog"></i>
        </RouterLink>
      </div>
    </div>
  </header>

  <Popover class="w-[550px]" :dismissable="false" ref="op">
    <div class="">
      <div class="mb-3 flex items-center justify-between">
        <span class="block font-medium">Уведомления</span>
        <i @click="toggle" class="pi pi-times cursor-pointer"></i>
      </div>

      <ul class="m-0 flex list-none flex-col p-0">
        <h2 v-if="!notifs.length" class="mb-4 text-center text-xl">
          У вас нет уведомлений
        </h2>
        <li
          v-for="notif of notifs"
          :key="notif.id"
          class="mb-4 flex items-center justify-between gap-2 px-2 py-3"
          :style="{ backgroundColor: notif.isRead ? 'initial' : '#fdfdde' }"
        >
          <p class="mr-auto max-w-[400px] text-justify text-sm">
            {{ notif.text }}
          </p>
          <i
            @click="() => readNotif(notif.id)"
            class="pi pi-check mr-4 cursor-pointer"
            v-if="!notif.isRead"
          ></i>
          <i
            @click="() => deleteNotif(notif.id)"
            class="pi pi-trash cursor-pointer"
          ></i>
        </li>
      </ul>
      <!-- @click не работает специально - 1 из дефектов -->
      <Button
        @click="1 /*() => deleteAllNotif()*/"
        v-if="notifs.length"
        class="mb-4 !bg-red-600 !p-2"
      >
        Удалить все уведомления
      </Button>
    </div>
  </Popover>
</template>

<style>
.router-link-exact-active:not(#settings) {
  border-bottom: 2px solid #ffffff;
}

.p-popover::before {
  margin-left: -28px !important;
}

.p-popover::after {
  margin-left: -26.2px !important;
}

#indicator {
  position: absolute;
  top: 0;
  left: 10px;
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f3ff52;
}
</style>
