<template>
  <div class="body">
    <div class="records">
      <template v-if="!session.isEmpty()">
        <div v-for="(r) in session.records" :key="r.chat_history_id" class="record" :class="r.who">
          <span class="avatar">{{ r.avatar }}</span>
          <div class="message">
            <div v-html="r.messageHtml" class="text"></div>
            <div class="opr" style="padding: 0.5rem 0.2rem 0.1rem 0.2rem;" v-if="r.who == Who.robot">
              <div></div>
              <div>
                <QuotationSource :docs="r.doc" v-if="!isEmpty(r.doc)"></QuotationSource>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <el-alert :title="blankTip" type="warning" class="record blank-tip" show-icon :closable="false" />
      </template>

      <div class="record robot" v-if="thinking">
        <span class="avatar">🤖</span>
        <div class="message">
          <div class="text">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <ChatInput v-model="param.query" :disabled="replying" :autofocus="true"
      :placeholder="replying ? REPLAYING : INPUT_TIP" @send="ask"></ChatInput>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, type Ref } from "vue";
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatMode, Who, ChatSession } from "./model";
import { Loading } from "@element-plus/icons-vue";
import { fetchStream } from "./fetchStream";
import 'highlight.js/styles/atom-one-dark-reasonable.css'
import { isEmpty } from "lodash";
import ChatInput from "@/components/chatinput/ChatInput.vue";
import QuotationSource from "./QuotationSource.vue";
import { INPUT_TIP, REPLAYING } from "@/constant";
import { useChatSessions } from "@/stores/chatSessions";

const props = defineProps({
  sessionId: {
    type: String,
    require: true
  }
})

const replying = ref(false); // 回答中
const thinking = ref(false); // 思考中

// 从pinia中获取session
const sessionStore = useChatSessions();
// @ts-ignore
const session: Ref<ChatSession> = ref(sessionStore.get(props.sessionId));
const param = session.value.param;

const blankTip = computed(() => {
  const mode = session.value.param.mode;
  let tip;
  switch (mode) {
    case ChatMode.Knowledge:
      tip = '您当前正处于知识库模式中, 请咨询跟知识库相关的内容';
      break;
    default:
      tip = '您当前正处于闲聊模式中, 回答内容不限定范围';
      break;
  }
  return `${tip}。请注意: AI答复不保证准确性，请自行甄别。`
})

/**
 * 发起提问
 */
function ask() {
  const { query = '' } = param;
  if (isEmpty(query)) {
    return;
  }

  session.value.fillHistory(); // 历史记录带上
  session.value.addQuestion(new ChatMessage(uuidv4(), query));
  clearQuery();
  fetchAndParse(query);
}

// 发起调用并解析
function fetchAndParse(query?: string) {
  fetchStream({
    ...param,
    query
  }, {
    onbeforeopen() {
      thinking.value = true;
    },
    onopen: function (/*chatId: string, res: Response*/) {
      replying.value = true;
    },
    onmessage: function (msgs: ChatMessage[]) {
      msgs.forEach(msg => session.value.addAnswer(msg));
      thinking.value = false;
    },
    ondone: function (chatId: string) {
      replying.value = false;
      thinking.value = false;

      const r = session.value.records.find(r => r.chat_history_id == chatId)
      if (!r) { // 没有此次对话记录，说明有问题，给出错误
        // TODO 因为当有记性时(>0)，后端会发生一个错误. issue: https://github.com/chatchat-space/Langchain-Chatchat/issues/2228
        // 因此会导致此问题, 但是发现，如果调整下history，又恢复了。所以这里将记性默默调整下, 避免导致后面始终报这个错。这是临时不可取的方案，等这个issue解决了，再进行修改。
        param.history_count = param.history_count ?? 5;
        if (param.history_count > 5) {
          param.history_count = param.history_count - 1;
        } else {
          param.history_count = param.history_count + 1;
        }
        session.value.addError(chatId, new Error('抱歉, 请重复一遍，我可能没听清.'));
      }
    },
    onerr: function (chatId, err) {
      replying.value = false;
      thinking.value = false;
      session.value.addError(chatId, err);
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
        // flex: 1;
        border-radius: 0.6rem;
        padding: 0.5rem;

        &>.text {
          max-width: 100%;
        }

        &>.opr {
          display: flex;

          &> :first-child {
            flex: 1;
          }
        }
      }
    }

    .you {
      flex-direction: row-reverse;

      .message {
        margin-left: $avatarSide;
        margin-right: 0.2rem;
        text-align: right;
        background-color: #94ea69;

        &>.text {
          display: inline-block;
          text-align: left;
        }
      }
    }

    .robot {
      text-align: left;

      .message {
        margin-left: 0.2rem;
        margin-right: $avatarSide;
        border: 1px solid #eaeaea;

        &>.text {
          display: inline-block;
        }
      }
    }

    .blank-tip {
      border-radius: 0.6rem;
      padding: 0.5rem;
      border: 1px solid rgb(219, 219, 219);
      width: 90%;
      margin: 0.5rem auto;
    }

  }
}
</style>
