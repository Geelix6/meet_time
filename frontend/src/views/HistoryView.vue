<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { forceLogout } from "../utils/forceLogout";
import Card from "primevue/card";
import Button from "primevue/button";
import moment from "moment";

const jwtToken = localStorage.getItem("jwtToken");
const router = useRouter();
const freetime = ref();
const historyMeetings = computed(() => {
  return freetime.value?.filter(
    (e: {
      timeStart: string | number | Date;
      timeEnd: string | number | Date;
      timeStatus: any;
    }) => {
      const end = new Date(e.timeEnd);
      const now = new Date(); //new Date(9999999999999)
      return e.timeStatus && end < now;
    },
  );
});

const getFreeTime = async () => {
  const response = await fetch("/api/users/get/freetime", {
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

const deleteMeet = async (id: string) => {
  const response = await fetch("/api/users/delete/meeting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({ freetimeId: id }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    freetime.value = await getFreeTime();
  }
};
onMounted(async () => {
  freetime.value = await getFreeTime();
});
</script>

<template>
  <div class="mt-4">
    <h1 v-if="!historyMeetings?.length" class="text-2xl">
      У вас нет прошлых встреч
    </h1>
    <Card class="mb-5" v-for="meet of historyMeetings">
      <template #content>
        <div class="flex items-center gap-x-2">
          <p>
            Вы встречались
            {{ moment(meet.timeStart).format(moment.HTML5_FMT.DATE) }}
          </p>
          <p>с {{ moment(meet.timeStart).format(moment.HTML5_FMT.TIME) }}</p>
          <p>до {{ moment(meet.timeEnd).format(moment.HTML5_FMT.TIME) }}</p>
          <p class="mr-auto">
            с пользователем {{ meet.timeStatus.split(" ").at(-1) }}
          </p>
          <Button class="!bg-orange-500" @click="() => deleteMeet(meet.id)"
            >Удалить запись</Button
          >
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
