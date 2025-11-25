<template>
  <div
    ref="container"
    class="relative w-full mx-auto flex flex-col gap-4 p-2 sm:p-4 h-full overflow-y-auto scroll-smooth
           sm:max-w-2xl md:max-w-4xl lg:max-w-6xl"
  >

    <template v-for="(msg, i) in messages" :key="i">
      <p v-if="msg.role === 'user'"
         class="ml-auto px-3 py-2 rounded-xl max-w-[90%] sm:max-w-[75%] bg-blue-500 text-white shadow-sm">
        {{ msg.text }}
      </p>

      <div v-else
           class="max-w-[90%] sm:max-w-[75%] markdown text-left text-gray-800 dark:text-gray-200"
           v-html="msg.html">
      </div>
    </template>

    <typingindicator v-if="isTyping" :darkMode="darkMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from "vue";
import typingindicator from "./typingindicator.vue";

const props = defineProps<{ messages: any[]; darkMode: boolean; isTyping: boolean }>();
const container = ref<HTMLDivElement | null>(null);

// détecter si utilisateur est en bas
const isUserAtBottom = ref(true);

onMounted(() => {
  const el = container.value;
  if (!el) return;

  el.addEventListener("scroll", () => {
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    isUserAtBottom.value = nearBottom;
  });
});

const scrollToBottom = () => {
  const el = container.value;
  if (!el || !isUserAtBottom.value) return;
  el.scrollTo({
    top: el.scrollHeight,
    behavior: "smooth"
  });
};

// Scroll quand un message arrive
watch(() => props.messages.length, () => {
  nextTick(scrollToBottom);
});

// Scroll quand l’IA tape
watch(() => props.isTyping, () => {
  nextTick(scrollToBottom);
});
</script>
