<template>
    <form @submit.prevent="submit"
          :class="hasConversation
                ? 'w-full mx-auto gap-2 pt-4 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl'
                : 'w-full mx-auto gap-2 pt-4 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl'">
      <div class="relative flex-1 max-w-4xl border rounded-3xl px-4 py-2 mx-auto"
           :class="darkMode ? 'bg-[#1E1F20] border-gray-700' : 'bg-white border-gray-300'">
  
        <textarea
          ref="inputRef"
          v-model="localMsg"
          placeholder="Écrivez votre message..."
          @input="resize"
          @keydown="onKey"
          class="w-full min-h-[100px] max-h-[500px] overflow-hidden bg-transparent focus:outline-none pr-12"
          rows="1"
        ></textarea>
  
        <button type="submit"
        :disabled="!localMsg.trim()"
        class="absolute right-2 top-1/2 -translate-y-2 rounded-full w-10 h-10 flex items-center justify-center shadow"
        :class="localMsg.trim() ? 'bg-[#1E1F20] text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
  <i class="pi pi-arrow-up"></i>
</button>

      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import "primeicons/primeicons.css";
  defineProps<{ darkMode: boolean; hasConversation: boolean }>();
  const emit = defineEmits(["submit"]);
  
  const localMsg = ref("");
  const inputRef = ref<HTMLTextAreaElement | null>(null);
  
  const resize = () => {
    inputRef.value!.style.height = "auto";
    inputRef.value!.style.height = inputRef.value!.scrollHeight + "px";
  };
  
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };
  
  const submit = () => {
    if (!localMsg.value.trim()) return;
    emit("submit", localMsg.value);
    localMsg.value = "";
    resize();
  };
  </script>
  