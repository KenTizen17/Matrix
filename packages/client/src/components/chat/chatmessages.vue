<template>
  <div ref="container"
       class="relative max-w-2xl flex flex-col gap-4 p-4 h-full scroll-smooth">

    <template v-for="(msg, i) in messages" :key="i">
      <p v-if="msg.role === 'user'"
         class="ml-auto px-4 py-2 rounded-xl max-w-[75%] bg-blue-500 text-white shadow-sm">
        {{ msg.text }}
      </p>

      <div v-else
           class="max-w-[75%] markdown text-left text-gray-800 dark:text-gray-200"
           v-html="msg.html">
      </div>
    </template>

    <typingindicator v-if="isTyping" :darkMode="darkMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import typingindicator from "./typingindicator.vue";

const props = defineProps<{ messages: any[]; darkMode: boolean; isTyping: boolean }>();
const container = ref<HTMLDivElement | null>(null);

// Scroll automatique en bas à chaque nouveau message
watch(() => props.messages.length, () =>
  nextTick(() => {
    if (container.value) container.value.scrollTop = container.value.scrollHeight;
  })
);
</script>