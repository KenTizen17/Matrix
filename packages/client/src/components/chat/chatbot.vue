<template>
  <div :class="darkMode ? 'dark' : ''"
       class="w-full h-full flex flex-col transition-colors duration-300">

    <header class="w-full flex justify-between p-4">
      <div class="font-semibold tracking-wide"
           :class="darkMode ? 'text-gray-200' : 'text-gray-700'">
        Matrix Chatbot
      </div>
      <div class="flex gap-4">
        <button @click="newConversation"
                class="flex items-center gap-2 px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors"
                :class="darkMode
                  ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
          <i class="pi pi-plus-circle"></i> Nouvelle conversation
        </button>

        <button @click="toggleDark"
                class="px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors"
                :class="darkMode
                  ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
          <i :class="darkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>
      </div>
    </header>

    <div 
      id="content"
      class="h-full w-full flex flex-col justify-center items-center"
      :class="conversation.length > 0 ? 'flex-1' : ''"
      >

      <!-- No conversation -->
      <div 
        v-if="conversation.length === 0"
        id="noconv" 
        class="flex flex-col">

        <h2 class="text-lg font-normal mb-6 text-center"
            :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
          Comment puis-je t'aider aujourd’hui mon chef ?
        </h2>

        <chatinput
          :darkMode="darkMode"
          :hasConversation="conversation.length > 0"
          @submit="handleSubmit"
        />

      </div>

      <!-- With conversation -->
      <div 
            v-if="conversation.length > 0"
        id="noconv" 
        class="flex flex-col">

        <div class="flex-1">
          <chatmessages
            v-if="conversation.length > 0"
            :messages="conversation"
            :darkMode="darkMode"
            :isTyping="isTyping"
          />
        </div>

        <div class="w-full">
          <chatinput
            :darkMode="darkMode"
            :hasConversation="conversation.length > 0"
            @submit="handleSubmit"
          />
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive} from "vue";
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
  if (!prompt.trim()) return;

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

  } catch (err: any) {
    console.error("API error:", err);
    conversation.push({
      role: "assistant",
      text: " Une erreur est survenue lors de la communication avec le serveur.",
      html: " Une erreur est survenue lors de la communication avec le serveur."
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