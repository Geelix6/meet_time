<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
// @ts-ignore
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import { useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";

const jwtToken = localStorage.getItem("jwtToken");
const router = useRouter();

const friends = ref<any[]>();
const nickOrEmail = ref("");
const addFriendMessage = ref("");
const errorFriendMessage = ref("");
const modal = ref(false);
const freetime = ref();

const events = computed(() => {
  return freetime.value?.map(
    (e: {
      timeStart: string | number | Date;
      timeEnd: string | number | Date;
    }) => ({
      title: "Свободное время",
      start: new Date(e.timeStart),
      end: new Date(e.timeEnd),
      class: "!bg-green-300",
    }),
  );
});

const addFriend = async () => {
  if (
    friends.value?.find((e) => {
      return e.username == nickOrEmail.value || e.email == nickOrEmail.value;
    })
  ) {
    errorFriendMessage.value = "Этот пользователь уже у вас в друзьях";
    setTimeout(() => (errorFriendMessage.value = ""), 5000);
    return;
  }

  const response = await fetch("/api/users/set/friendship", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ nickOrEmail: nickOrEmail.value }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    if (response.status == 228) {
      errorFriendMessage.value = "Пользователя с таким ником нет";
      setTimeout(() => (errorFriendMessage.value = ""), 5000);
      return;
    }
    if (response.status == 262) {
      errorFriendMessage.value = "Это вы сами.";
      setTimeout(() => (errorFriendMessage.value = ""), 5000);
      return;
    }
    friends.value = await getFriends();
    addFriendMessage.value = "Приглашение другу отправлено";
    setTimeout(() => (addFriendMessage.value = ""), 5000);
    return await response.json();
  }
};

const getFriends = async () => {
  const response = await fetch("/api/users/get/friends", {
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

const acceptFriend = async (friendId: string, pairId: string) => {
  const response = await fetch("/api/users/accept/friend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ friendId, pairId }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    friends.value = await getFriends();
    return await response.json();
  }
};

const deleteFriend = async (friendId: string, pairId: string) => {
  const response = await fetch("/api/users/delete/friend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ friendId, pairId }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    friends.value = await getFriends();
    return await response.json();
  }
};

const getFriendFreetime = async (id: string) => {
  modal.value = true;

  const response = await fetch("/api/users/get/freetime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    freetime.value = await response.json();
  }
};

onMounted(async () => {
  friends.value = await getFriends();
});
</script>

<template>
  <h2 class="mb-4 mt-2 text-2xl">Добавить друга</h2>
  <div class="mb-4 flex items-center gap-4">
    <label for="nickOrEmail" class="w-48">Никнейм или Email</label>
    <InputText
      autocomplete="off"
      type="text"
      v-model:model-value="nickOrEmail"
      id="nickOrEmail"
      class="w-56"
    />
    <Button type="button" label="Искать" @click="() => addFriend()"></Button>
  </div>
  <p class="mb-16">
    <span class="text-green-500">{{ addFriendMessage }}</span>
    <span class="text-red-500">{{ errorFriendMessage }}</span>
  </p>
  <h2 class="mb-4 text-2xl">Ваши друзья</h2>
  <h3 v-if="!friends?.length">
    Их пока что нет, добавьте своего первого друга!
  </h3>
  <Card v-for="friend of friends" class="mb-4">
    <template #content>
      <div class="flex items-center">
        <p class="mr-auto">Ник: {{ friend.username }}</p>
        <template v-if="!friend.isApproved">
          <div v-if="friend.initiator == friend.id" class="flex gap-x-4">
            <Button
              type="button"
              label="Принять дружбу"
              @click="() => acceptFriend(friend.id, friend.pairId)"
            ></Button>
            <Button
              type="button"
              label="Отклонить дружбу"
              class="!bg-red-500"
              @click="() => deleteFriend(friend.id, friend.pairId)"
            ></Button>
          </div>
          <p v-else>Ожидаем одобрения дружбы</p>
        </template>
        <template v-else>
          <div class="flex gap-x-4">
            <Button
              type="button"
              label="Посмотреть расписание"
              @click="() => getFriendFreetime(friend.id)"
            ></Button>
            <Button
              type="button"
              label="Удалить"
              class="!bg-red-500"
              @click="() => deleteFriend(friend.id, friend.pairId)"
            ></Button>
          </div>
        </template>
      </div>
    </template>
  </Card>

  <Dialog
    modal
    v-model:visible="modal"
    header="Cвободное время друга"
    class="!w-[80vw] max-w-[80vw]"
  >
    <vue-cal
      small
      locale="ru"
      class="mb-6 h-full"
      active-view="week"
      show-time-in-cells
      :events="events"
      :disable-views="['years', 'year', 'day', 'month']"
    />
  </Dialog>
</template>

<style scoped></style>
