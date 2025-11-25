<template>
  <div :class="darkMode ? 'dark' : ''"
       class="w-full h-screen flex flex-col items-center pt-10 transition-colors duration-300">


    <div class="absolute top-4 left-4 font-semibold tracking-wide"
         :class="darkMode ? 'text-gray-200' : 'text-gray-700'">
      Matrix Chatbot
    </div>

    <button @click="newConversation"
            class="absolute top-4 right-24 flex items-center gap-2 px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors"
            :class="darkMode
              ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
      <i class="pi pi-plus-circle"></i> Nouvelle conversation
    </button>

    <button @click="toggleDark"
            class="absolute top-4 right-4 px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors"
            :class="darkMode
              ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
      <i :class="darkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
    </button>

    <h2 v-if="conversation.length === 0"
        class="text-lg font-normal mb-6 text-center"
        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
      Comment puis-je t'aider aujourd’hui mon chef ?
    </h2>

    <chatmessages
      v-if="conversation.length > 0"
      :messages="conversation"
      :darkMode="darkMode"
      :isTyping="isTyping"
    />

    <chatinput
      :darkMode="darkMode"
      :hasConversation="conversation.length > 0"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from "vue";
import axios from "axios";
import MarkdownIt from "markdown-it";
import chatmessages from "./chatmessages.vue";
import chatinput from "./chatinput.vue";

const md = new MarkdownIt();

const darkMode = ref(false);
const conversation = reactive<{ role: "user" | "assistant"; text: string; html?: string }[]>([]);
const isTyping = ref(false);
const conversationId = ref(crypto.randomUUID());

const toggleDark = () => {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle('dark', darkMode.value);
};


const handleSubmit = async (prompt: string) => {
  conversation.push({ role: "user", text: prompt });
  isTyping.value = true;

  try {
    const { data } = await axios.post("http://localhost:3000/api/chat", {
      prompt,
      conversationId: conversationId.value
    });

    conversation.push({
      role: "assistant",
      text: data.message,
      html: md.render(data.message)
    });
  } finally {
    isTyping.value = false;
  }
};

const newConversation = () => {
  conversation.splice(0, conversation.length);
  conversationId.value = crypto.randomUUID();
};
</script>
