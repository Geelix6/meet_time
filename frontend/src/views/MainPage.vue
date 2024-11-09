<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import AppFooter from "../components/AppFooter.vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";

const router = useRouter();
const modal = ref({ isOpen: false, reason: "" });
const userData = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  nickOrEmail: "",
});
const errorMessage = ref("");

const resetFields = () => {
  userData.value.firstName = "";
  userData.value.lastName = "";
  userData.value.username = "";
  userData.value.email = "";
  userData.value.password = "";
  userData.value.nickOrEmail = "";
  errorMessage.value = "";
};

const openRegModal = () => {
  modal.value.isOpen = true;
  modal.value.reason = "reg";
  resetFields();
};

const openLoginModal = () => {
  modal.value.isOpen = true;
  modal.value.reason = "login";
  resetFields();
};

const closeModal = () => {
  modal.value.isOpen = false;
  modal.value.reason = "";
  resetFields();
};

const createUser = async () => {
  const NewUserData = {
    firstName: userData.value.firstName,
    lastName: userData.value.lastName,
    username: userData.value.username,
    email: userData.value.email,
    password: userData.value.password,
  };

  const response = await fetch("/api/users/create/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(NewUserData),
  });

  if (response.ok) {
    let jwtToken = await response.json();
    localStorage.setItem("jwtToken", jwtToken);
    router.push("/lk");
  } else {
    const message = await response.json();
    console.log(message);
    if (message.code == "P2002") {
      errorMessage.value = "Данная почта или ник уже заняты";
    }
  }
};

const loginUser = async () => {
  const existUserData = {
    nickOrEmail: userData.value.nickOrEmail,
    password: userData.value.password,
  };

  const response = await fetch("/api/users/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(existUserData),
  });

  if (response.ok) {
    let jwtToken = await response.json();
    localStorage.setItem("jwtToken", jwtToken);
    router.push("/lk");
  } else {
    const message = await response.json();
    console.log(message);
  }
};
</script>

<template>
  <header
    class="relative mx-auto mb-10 flex aspect-video max-h-svh w-full flex-col items-center justify-center bg-[url('/main-page-image.png')] bg-cover px-4 text-white"
  >
    <a
      href="./lk"
      class="absolute right-3 top-3 text-sm font-light tracking-widest underline md:right-8 md:top-8 md:text-xl"
      @click.prevent="openLoginModal()"
    >
      войти
    </a>
    <div class="flex flex-col gap-y-1 md:gap-y-5">
      <h1 class="text-center text-4xl md:text-6xl">Meet & Time</h1>
      <p class="text-center text-lg md:text-2xl">
        Организация встреч с друзьями стала легче
      </p>
    </div>

    <Button
      @click="openRegModal()"
      class="!absolute bottom-2 !bg-white !text-black md:bottom-5"
      label="Попробовать"
      raised
    />
  </header>
  <div class="mx-auto max-w-screen-lg">
    <section class="mb-20 px-4">
      <h2 class="mb-5 text-center text-4xl">Почему Meet & Time</h2>
      <div class="mx-auto grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        <Card>
          <template #title>Advanced Card</template>
          <template #content>
            <p>
              Далеко-далеко за словесными горами в стране гласных и согласных
              живут рыбные тексты. Живет, курсивных текст? Живет.
            </p>
          </template>
        </Card>
        <Card>
          <template #title>Advanced Card</template>
          <template #content>
            <p>
              Далеко-далеко за словесными горами в стране гласных и согласных
              живут рыбные тексты. Живет, курсивных текст? Живет.
            </p>
          </template>
        </Card>
        <Card>
          <template #title>Advanced Card</template>
          <template #content>
            <p>
              Далеко-далеко за словесными горами в стране гласных и согласных
              живут рыбные тексты. Живет, курсивных текст? Живет.
            </p>
          </template>
        </Card>
        <Card>
          <template #title>Advanced Card</template>
          <template #content>
            <p>
              Далеко-далеко за словесными горами в стране гласных и согласных
              живут рыбные тексты. Живет, курсивных текст? Живет.
            </p>
          </template>
        </Card>
      </div>
    </section>
    <section class="mb-20 px-4">
      <h2 class="mb-5 text-center text-4xl">Частозадаваемые вопросы</h2>
      <Accordion :value="['0']" multiple>
        <AccordionPanel value="0">
          <AccordionHeader>Первый вопрос</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader>Второй вопрос</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
              velit, sed quia non numquam eius modi.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="2">
          <AccordionHeader>Еще очень интересный вопрос</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </section>
  </div>
  <AppFooter />

  <Dialog
    modal
    v-model:visible="modal.isOpen"
    :header="modal.reason == 'reg' ? 'Зарегестрироваться' : 'Войти в аккаунт'"
    class="w-[80vw] max-w-lg"
    @hide="closeModal()"
  >
    <span class="mb-4 block">Заполните форму</span>

    <div v-if="modal.reason == 'login'" class="mb-4 flex items-center gap-4">
      <label for="nickOrEmail" class="w-24 font-semibold"
        >Никнейм или Email</label
      >
      <InputText
        autocomplete="off"
        type="text"
        v-model:model-value="userData.nickOrEmail"
        id="nickOrEmail"
        class="w-3/4 flex-auto"
      />
    </div>
    <div v-if="modal.reason == 'reg'" class="mb-4 flex items-center gap-4">
      <label for="firstName" class="w-24 font-semibold">Имя</label>
      <InputText
        autocomplete="off"
        type="text"
        v-model:model-value="userData.firstName"
        id="firstName"
        class="w-3/4 flex-auto"
      />
    </div>
    <div v-if="modal.reason == 'reg'" class="mb-4 flex items-center gap-4">
      <label for="lastName" class="w-24 font-semibold">Фамилия</label>
      <InputText
        autocomplete="off"
        type="text"
        v-model:model-value="userData.lastName"
        id="lastName"
        class="w-3/4 flex-auto"
      />
    </div>
    <div v-if="modal.reason == 'reg'" class="mb-4 flex items-center gap-4">
      <label for="username" class="w-24 font-semibold">Никнейм</label>
      <InputText
        autocomplete="off"
        type="text"
        v-model:model-value="userData.username"
        id="username"
        class="w-3/4 flex-auto"
      />
    </div>
    <div v-if="modal.reason == 'reg'" class="mb-4 flex items-center gap-4">
      <label for="email" class="w-24 font-semibold">Email</label>
      <InputText
        autocomplete="off"
        type="email"
        v-model:model-value="userData.email"
        id="email"
        class="w-3/4 flex-auto"
      />
    </div>
    <div class="mb-8 flex items-center gap-4">
      <label for="password" class="w-24 font-semibold">Пароль</label>
      <InputText
        autocomplete="off"
        type="password"
        v-model:model-value="userData.password"
        id="password"
        class="w-3/4 flex-auto"
      />
    </div>
    <span v-if="errorMessage != ''" class="mb-4 block text-orange-700">{{
      errorMessage
    }}</span>
    <span
      v-if="modal.reason == 'login'"
      @click="openRegModal()"
      class="mb-3 block cursor-pointer underline"
    >
      Еще нет аккаунта?
    </span>
    <span
      v-else
      @click="openLoginModal()"
      class="mb-3 block cursor-pointer underline"
    >
      Уже есть аккаунт?
    </span>

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Отмена"
        severity="secondary"
        @click="closeModal()"
      ></Button>
      <Button
        v-if="modal.reason == 'login'"
        type="button"
        label="Вход"
        @click="loginUser()"
      ></Button>
      <Button
        v-else
        type="button"
        label="Созадть аккаунт"
        @click="createUser()"
      ></Button>
    </div>
  </Dialog>
</template>

<style scoped></style>
