<template>
  <div class="body">
    <div class="records">
      <div v-for="(r) in session.records" :key="r.chat_history_id" class="record" :class="r.who">
        <span class="avatar">{{ r.avatar }}</span>
        <div class="message">
          <div v-html="r.renderHtml" class="text"></div>
        </div>
      </div>
    </div>

    <ChatInput v-model="param.query" :disabled="replying" :autofocus="true"
      :placeholder="replying ? REPLAYING : INPUT_TIP" @send="ask"></ChatInput>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, type Ref } from "vue";
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatSession } from "./model";
import { fetchStream } from "./fetchStream";
import 'highlight.js/styles/atom-one-dark-reasonable.css'
import { isEmpty } from "lodash";
import ChatInput from "@/components/chatinput/ChatInput.vue";
import { INPUT_TIP, REPLAYING } from "@/constant";
import { useChatSessions } from "@/stores/chatSessions";

const props = defineProps({
  sessionId: {
    type: String,
    require: true
  }
})

const replying = ref(false);

 // 从pinia中获取session
const sessionStore = useChatSessions();
// @ts-ignore
const session: Ref<ChatSession> = ref(sessionStore.get(props.sessionId));
const param = session.value.param;

/**
 * 发起提问
 */
function ask() {
  const { query } = param;
  if (isEmpty(query)) {
    return;
  }
  session.value.addQuestion(new ChatMessage(uuidv4(), query));
  clearQuery();
  fetchAndParse(query);
}

// 发起调用并解析
function fetchAndParse(query?: string) {
  // TODO 封装历史记录：根据配置的参数取历史的近n条数据，放到参数param里
  fetchStream({
    ...param,
    query
  }, {
    onopen: function (/*res*/) {
      replying.value = true;
    },
    onmessage: function (msgs: ChatMessage[]) {
      msgs.forEach(msg => session.value.addAnswer(msg));
    },
    ondone: function () {
      replying.value = false;
    },
    onerr: function (err) {
      replying.value = false;
      session.value.addError(err);
      console.error(err);
    }
  })
}

// 清除输入项
function clearQuery() {
  param.query = '';
}

onBeforeUnmount(() => {
  if (session.value.isEmpty()) {  // 如果会话为空, 则移除
    sessionStore.remove(props.sessionId)
  } else { // 如果会话不为空，则调后端API持久化
    // TODO 持久化会话
  }
});
</script>

<style scoped lang="scss">
.body {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &>.records {
    flex: 1;
    overflow: hidden auto;

    $avatarSide: 2rem;

    &>.record {
      display: flex;
      align-items: flex-start;
      overflow: hidden;
      padding: 0.6rem;

      .avatar {
        display: inline-block;
        text-align: center;
        width: $avatarSide;
        height: $avatarSide;
      }

      .message {
        flex: 1;
        width: 0;

        &>.text {
          max-width: 100%;
          border-radius: 0.6rem;
          padding: 0.5rem;
        }
      }
    }

    .you {
      flex-direction: row-reverse;

      .message {
        margin-left: $avatarSide;
        margin-right: 0.2rem;
        text-align: right;

        &>.text {
          display: inline-block;
          background-color: #94ea69;
          text-align: left;
        }
      }
    }

    .robot {
      text-align: left;

      .message {
        margin-left: 0.2rem;
        margin-right: $avatarSide;

        &>.text {
          display: inline-block;
          background-color: #ffffff;
        }
      }
    }

  }
}
</style>
