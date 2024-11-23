<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import { forceLogout } from "../utils/forceLogout";
// @ts-ignore
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import { useRouter } from "vue-router";
import moment from "moment";
// import { useUserStore } from "../stores/userStore";

const jwtToken = localStorage.getItem("jwtToken");
const router = useRouter();

const freetime = ref<any[]>();

const day = ref<Date>();
const timeStart = ref<Date>();
const timeEnd = ref<Date>();

const modal = ref(false);
const modalDeleteTime = ref(false);
const modalMeetingDelete = ref(false);

const errorMessage = ref("");

const events = computed(() => {
  const freetimes = freetime.value?.map((e) => {
    return {
      start: new Date(e.timeStart),
      end: new Date(e.timeEnd),
      title: e.timeStatus || "Свободное время",
      class: e.timeStatus ? "!bg-violet-300" : "!bg-green-300",
    };
  });

  return freetimes?.filter((e) => {
    const d1 = new Date(e.end);
    const d2 = new Date();
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffInMs = +d1 - +d2;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays > -1;
    // return true;
  });
});

const countMeetings = computed(() => {
  return freetime.value?.filter((e) => e.timeStatus).length;
});

const timeStartD = computed(
  () =>
    new Date(
      day.value!.getFullYear(),
      day.value!.getMonth(),
      day.value!.getDate(),
      timeStart.value!.getHours(),
      timeStart.value!.getMinutes(),
      timeStart.value!.getSeconds(),
    ),
);

const timeEndD = computed(
  () =>
    new Date(
      day.value!.getFullYear(),
      day.value!.getMonth(),
      day.value!.getDate(),
      timeEnd.value!.getHours(),
      timeEnd.value!.getMinutes(),
      timeEnd.value!.getSeconds(),
    ),
);

const onEventClick = (e: {
  start: Date | undefined;
  end: Date | undefined;
  title: string;
}) => {
  if (e.title.startsWith("Встреча")) {
    modalMeetingDelete.value = true;
  } else {
    modalDeleteTime.value = true;
  }
  timeStart.value = e.start;
  timeEnd.value = e.end;
};

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

const setFreetime = async () => {
  if (!(timeStart.value && timeEnd.value && day)) {
    errorMessage.value = "Не все поля заполнены";
    return;
  }

  if (timeEndD.value < timeStartD.value) {
    errorMessage.value = "Время конца больше времени начала";
    return;
  }

  if (timeEndD.value < new Date() || timeStartD.value < new Date()) {
    errorMessage.value = "Нельзя назначать свободное время в прошлом";
    return;
  }

  const response = await fetch("/api/users/set/freetime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({
      timeStart: timeStartD.value,
      timeEnd: timeEndD.value,
    }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    if (response.status == 228) {
      errorMessage.value = "Данный диапазон пересекается с уже существующим";
      return;
    }

    freetime.value = await getFreeTime();
    closeModal();
    return await response.json();
  }
};

const deleteFreetime = async () => {
  const response = await fetch("/api/users/delete/freetime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    body: JSON.stringify({
      timeStart: timeStart.value,
      timeEnd: timeEnd.value,
    }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    freetime.value = await getFreeTime();

    modalDeleteTime.value = false;
  }
};

const deleteMeeting = async () => {
  const response = await fetch("/api/users/delete/meeting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${jwtToken}`,
    },

    // переделать, передавать start и end фри тайма
    // а потом искать как в userService.deleteFreeTime
    body: JSON.stringify({
      timeStart: timeStart.value,
      timeEnd: timeEnd.value,
    }),
  });

  if (!response.ok) {
    forceLogout(response.status, router);
  } else {
    freetime.value = await getFreeTime();
    closeModal();
  }
};

const openModal = () => {
  modal.value = true;
};

const closeModal = () => {
  modal.value = false;
  modalDeleteTime.value = false;
  modalMeetingDelete.value = false;
  day.value = undefined;
  timeStart.value = undefined;
  timeEnd.value = undefined;
  errorMessage.value = "";
};

onMounted(async () => {
  freetime.value = await getFreeTime();
});
</script>

<template>
  <div class="py-5">
    <vue-cal
      small
      locale="ru"
      class="mb-6 !h-[600px] w-full"
      active-view="week"
      show-time-in-cells
      :disable-views="['years', 'year', 'day', 'month']"
      :events="events"
      :on-event-click="onEventClick"
    />
    <Button @click="openModal" class="btn mb-6 mt-4"
      >Добавить свободное время</Button
    >

    <h2 class="mb-2 text-2xl">
      Количество будущих встреч: {{ countMeetings }}
    </h2>
    <p>Для отмены встречи нажмите на карточку и отмените ее</p>
  </div>

  <Dialog
    modal
    v-model:visible="modal"
    header="Назначить свободное время"
    class="w-[80vw] max-w-lg"
    @hide="closeModal()"
  >
    <span class="mb-4 block">Выберите свободное время</span>

    <div class="mb-4 flex gap-x-4">
      <span class="w-32">День</span>
      <DatePicker
        @update:modelValue="errorMessage = ''"
        id="datepicker-24h"
        v-model="day"
        hourFormat="24"
        fluid
      />
    </div>

    <div class="mb-4 flex gap-x-4">
      <span class="w-32">Время начала</span>
      <DatePicker
        @update:modelValue="errorMessage = ''"
        id="datepicker-24h"
        v-model="timeStart"
        time-only
        hourFormat="24"
        fluid
      />
    </div>

    <div class="mb-4 flex gap-x-4">
      <span class="w-32">Время конца</span>
      <DatePicker
        @update:modelValue="errorMessage = ''"
        id="datepicker-24h"
        v-model="timeEnd"
        time-only
        hourFormat="24"
        fluid
      />
    </div>

    <Button class="mb-3 !flex" @click="setFreetime">Добавить</Button>
    <span class="text-orange-500">{{ errorMessage }} </span>
  </Dialog>

  <Dialog
    modal
    v-model:visible="modalDeleteTime"
    header="Информация о свободном времени"
    class="w-[80vw] max-w-lg"
    @hide="closeModal()"
  >
    <div class="mb-2 flex gap-x-4">
      <span>Начало: </span>
      <span>{{ moment(timeStart).format(moment.HTML5_FMT.TIME) }}</span>
      <span>{{ moment(timeStart).format(moment.HTML5_FMT.DATE) }}</span>
    </div>
    <div class="mb-4 flex gap-x-4">
      <span>Конец: </span>
      <span>{{ moment(timeEnd).format(moment.HTML5_FMT.TIME) }}</span>
      <span>{{ moment(timeEnd).format(moment.HTML5_FMT.DATE) }}</span>
    </div>

    <Button @click="deleteFreetime" class="!bg-orange-500">Удалить</Button>
  </Dialog>

  <Dialog
    modal
    v-model:visible="modalMeetingDelete"
    header="Информация о встрече"
    class="w-[80vw] max-w-lg"
    @hide="closeModal()"
  >
    <div class="mb-2 flex gap-x-4">
      <span>Начало: </span>
      <span>{{ moment(timeStart).format(moment.HTML5_FMT.TIME) }}</span>
      <span>{{ moment(timeStart).format(moment.HTML5_FMT.DATE) }}</span>
    </div>
    <div class="mb-4 flex gap-x-4">
      <span>Конец: </span>
      <span>{{ moment(timeEnd).format(moment.HTML5_FMT.TIME) }}</span>
      <span>{{ moment(timeEnd).format(moment.HTML5_FMT.DATE) }}</span>
    </div>

    <Button @click="deleteMeeting" class="!bg-orange-500"
      >Отменить встречу</Button
    >
  </Dialog>
</template>

<style>
.vuecal__header > .vuecal__menu[role="tablist"] {
  display: none !important;
}

.vuecal__event {
  cursor: pointer !important;
}

.vuecal__no-event {
  display: none !important;
}
</style>
