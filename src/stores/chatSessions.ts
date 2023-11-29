import {defineStore} from "pinia";
import {ref} from 'vue';
import {ChatSession} from "@/views/chat2llm/model";

/**
 * 采用组合式API定义store, 第二个参数将被视作setup函数
 */
export const useChatSessions = defineStore('chatRecords', () => {
  const bucket = ref([] as Array<ChatSession>[]);

  function get(sessionId: string) {
    return bucket.value.find(s => s.sessionId === sessionId);
  }

  function put(session: ChatSession) {
    const index = bucket.value.findIndex(s => s.sessionId === session.sessionId);
    if (index === -1) {
      bucket.value.push(session);
    }
  }

  function remove(sessionId: string) {
    const index = bucket.value.findIndex(s => s.sessionId === sessionId);
    if (index > -1) {
      bucket.value.splice(index, 1);
    }
  }

  return {get, put, remove, bucket}
})
