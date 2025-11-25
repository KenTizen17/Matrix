<template>
  <div class="max-w-[75%] text-left text-gray-800 dark:text-gray-200">
    <span class="typing"></span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ darkMode: boolean }>();
</script>

<style>
.typing::after {
  content: "...";
  animation: dots 1.5s steps(4, end) infinite;
}
@keyframes dots {
  0%,20% { content:""; }
  40%    { content:"."; }
  60%    { content:".."; }
  80%,100% { content:"..."; }
}
</style>
