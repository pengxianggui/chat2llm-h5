import { defineStore } from "pinia";
import { ref } from 'vue';
import { ChatMode, ChatSession } from "@/views/chat2llm/model";
import { getSessions } from "@/api/session";

/**
 * 采用组合式API定义store, 第二个参数将被视作setup函数
 */
export const useChatSessions = defineStore('sessions', () => {
  const bucket = ref([] as ChatSession[]);

  function init() {
    return new Promise<ChatSession[]>((resolve, reject) => {
      bucket.value.length = 0
      getSessions().then(({ data }) => {
        data.forEach(item => {
          const { session_id, session_name, mode, param, create_time } = item
          const session: ChatSession = new ChatSession(session_id, ChatMode[mode], JSON.parse(param));
          session.sessionName = session_name
          session.create_time = create_time
          bucket.value.push(session);
        })

        resolve(bucket.value)
      }).catch(err => {
        reject(err)
      })
    })
  }

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

  function isEmpty() {
    return bucket.value.length == 0;
  }

  return { get, put, remove, init, isEmpty, bucket }
})
