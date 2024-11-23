<script setup lang="ts">
import { RouterLink } from "vue-router";
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
        <!-- <RouterLink to="./history" class="transition-opacity hover:opacity-80">
          История
        </RouterLink> -->
      </nav>
      <div class="flex items-center gap-x-8">
        <!-- <i
          class="pi pi-bell cursor-pointer transition-opacity hover:opacity-80"
        ></i> -->
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
</template>

<style>
.router-link-exact-active:not(#settings) {
  border-bottom: 2px solid #ffffff;
}
</style>
