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
const modalCreateMeet = ref(false);
const modalDeleteMeet = ref(false);
const friendFreetime = ref();
const chosenFriend = ref();
const chosenFreetime = ref();

const events = computed(() => {
  const freetimes = friendFreetime.value?.map(
    (e: {
      timeStart: string | number | Date;
      timeEnd: string | number | Date;
      id: string;
      timeStatus: string;
    }) => ({
      freeTimeId: e.id,
      start: new Date(e.timeStart),
      end: new Date(e.timeEnd),
      title: e.timeStatus || "Свободное время",
      class: e.timeStatus ? "!bg-violet-300" : "!bg-green-300",
    }),
  );

  return freetimes?.filter((e: { end: string | number | Date }) => {
    const d1 = new Date(e.end);
    const d2 = new Date();
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffInMs = +d1 - +d2;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays > -1;
  });
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
    chosenFriend.value = id;
    friendFreetime.value = await response.json();
  }
};

const onEventClick = async (e: { freeTimeId: string; title: string }) => {
  if (e.title.startsWith("Встреча")) {
    // как-то заранее проверить и не открывать модалку, если не мы назанчали эту встречу
    const response = await fetch("/api/users/check/freetime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ id: e.freeTimeId, title: e.title }),
    });

    if (!response.ok) {
      forceLogout(response.status, router);
    }
    if (response.status == 228) {
      return;
    } else {
      modalDeleteMeet.value = true;
    }
  } else {
    modalCreateMeet.value = true;
  }

  chosenFreetime.value = e.freeTimeId;
};

const createMeet = async () => {
  const response = await fetch("/api/users/set/meeting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ freetimeId: chosenFreetime.value }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    modalCreateMeet.value = false;
    await getFriendFreetime(chosenFriend.value);
  }
};

const deleteMeet = async () => {
  const response = await fetch("/api/users/delete/meeting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ freetimeId: chosenFreetime.value }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    modalDeleteMeet.value = false;
    await getFriendFreetime(chosenFriend.value);
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
      :on-event-click="onEventClick"
    />
  </Dialog>

  <Dialog
    modal
    v-model:visible="modalCreateMeet"
    header="Назначить встречу?"
    class="!w-[40vw] max-w-[80vw]"
  >
    <Button type="button" label="Да!" @click="() => createMeet()"></Button>
  </Dialog>

  <Dialog
    modal
    v-model:visible="modalDeleteMeet"
    header="Отменить встречу?"
    class="!w-[40vw] max-w-[80vw]"
  >
    <Button type="button" label="Да" @click="() => deleteMeet()"></Button>
  </Dialog>
</template>

<style scoped></style>
