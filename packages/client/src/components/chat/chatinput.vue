<template>
    <form @submit.prevent="submit"
          :class="hasConversation
                ? 'w-full max-w-2xl flex-1 items-end gap-2 pt-4'
                : 'w-full max-w-2xl flex-1 items-end gap-2 pt-4'">
      <div class="relative flex-1 max-w-2xl border rounded-3xl px-4 py-2"
           :class="darkMode ? 'bg-[#1E1F20] border-gray-700' : 'bg-white border-gray-300'">
  
        <textarea
          ref="inputRef"
          v-model="localMsg"
          placeholder="Écrivez votre message..."
          @input="resize"
          @keydown="onKey"
          class="w-full min-h-[40px] max-h-[200px] resize-none overflow-hidden bg-transparent focus:outline-none pr-12"
          rows="1"
        ></textarea>
  
        <button type="submit"
                :disabled="!localMsg.trim()"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center shadow"
                :class="localMsg.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'">
          <i class="pi pi-arrow-up"></i>
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import "primeicons/primeicons.css";
  const props = defineProps<{ darkMode: boolean; hasConversation: boolean }>();
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
  