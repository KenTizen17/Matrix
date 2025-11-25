<template>
  <div :class="darkMode ? 'dark' : ''"
       class="w-full h-full flex flex-col transition-colors duration-300 bg-white dark:bg-[#121212]">

    <header class="w-full flex justify-between items-center p-4 border-b dark:border-gray-800 shrink-0 z-10">
      <div class="font-semibold tracking-wide text-lg"
           :class="darkMode ? 'text-gray-200' : 'text-gray-700'">
        Matrix Chatbot
      </div>
      <div class="flex gap-4">
        <button @click="newConversation"
                class="flex items-center gap-2 px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors cursor-pointer"
                :class="darkMode
                  ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
          <i class="pi pi-plus-circle"></i> <span class="hidden sm:inline">Nouvelle conversation</span>
        </button>

        <button @click="toggleDark"
                class="px-3 py-1 rounded-xl border shadow-sm text-sm transition-colors cursor-pointer"
                :class="darkMode
                  ? 'bg-[#1E1F20] text-gray-200 border-gray-700 hover:bg-[#2A2B2C]'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'">
          <i :class="darkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>
      </div>
    </header>

<div class="flex-1 w-full flex items-center min-h-0">

  <!-- Conteneur des messages et état vide -->
  <div class="w-full max-w-6xl h-full justify-center flex flex-col mx-auto">

    <div class="flex-1 w-full max-w-6xl mx-auto flex flex-col overflow-y-auto">

      <!-- Si la conversation est vide, on centre le contenu -->
      <div v-if="conversation.length === 0"
           class="flex-1 flex flex-col justify-center p-4">
        <h2 :class="darkMode ? 'text-gray-300' : 'text-gray-700'"
            class="text-2xl font-medium text-center mb-4">
          Comment puis-je t'aider aujourd’hui mon chef ?
        </h2>

        <!-- Input centré -->
        <chatinput
          :darkMode="darkMode"
          :hasConversation="false"
          @submit="handleSubmit"
        />
      </div>

      <!-- Si la conversation existe, on montre les messages -->
      <div v-else class="w-full max-w-4xl mx-auto h-full justify-center flex flex-col">
        <chatmessages
          :messages="conversation"
          :darkMode="darkMode"
          :isTyping="isTyping"
        />
      </div>

    </div>

    <!-- Input en bas uniquement si conversation existe -->
<!-- Input en bas uniquement si conversation existe -->
<div v-if="conversation.length > 0"
     class="w-full flex flex-col justify-center items-center p-4 shrink-0 transition-colors duration-300 gap-2">
  
  <chatinput
    :darkMode="darkMode"
    :hasConversation="true"
    @submit="handleSubmit"
  />

  <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
    Réponse générées par IA, faites attention ! 
  </p>
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
    const { data } = await axios.post("/api/chat", {
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