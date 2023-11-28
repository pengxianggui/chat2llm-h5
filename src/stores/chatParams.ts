import { RequestParam } from "@/views/chat2llm/model";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useChatParams = defineStore('chatParams', () => {
    const chatParams = ref(new RequestParam());

    function set(params: RequestParam) {
        chatParams.value = params;
    }

    function get() {
        return chatParams;
    }

    return { set, get, chatParams }
})