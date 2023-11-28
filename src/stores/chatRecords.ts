import {defineStore} from "pinia";
import {ref} from 'vue';
import {ChatRecord, ChatSession} from "@/views/chat2llm/model";

/**
 * 采用组合式API定义store, 第二个参数将被视作setup函数
 */
export const useChatRecords = defineStore('chatRecords', () => {
  const bucket = ref([] as Array<ChatSession>[]);

  function get(sessionId: string) {
    const s = bucket.value.find(s => s.sessionId === sessionId);
    if (s) {
      return s;
    }

    return new ChatSession(sessionId);
  }

  function put(session: ChatSession) {
    const s = bucket.value.find(s => s.sessionId === session.sessionId);
    if (!s) {
      bucket.value.push(session);
    }
  }

  return {get, put, bucket}
})
