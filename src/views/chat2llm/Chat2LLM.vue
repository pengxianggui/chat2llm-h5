<template>
  <div class="body">
    <div class="records">
      <div class="load-more" v-if="!session.isEmpty()">
        <el-link :underline="false" type="primary" @click="loadHistory(null, 5)" v-if="hasMoreHistory">加载更多</el-link>
      </div>
      <template v-if="!session.isEmpty()">
        <div v-for="(r, index) in session.records" :key="r.chat_history_id" class="record" :class="r.who">
          <!-- <span class="avatar">{{ r.avatar }}</span> -->
          <div class="message">
            <div class="text">
              <div v-html="r.messageHtml"></div>
              <div v-if="r.thinking && isEmpty(r.messageHtml)">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
            <div class="opr" style="padding: 0.5rem 0.2rem 0.1rem 0.2rem;" v-if="r.who == Who.robot">
              <span v-if="r.thinking">
                <el-icon class="is-loading" v-if="r.thinking"><Loading /></el-icon>
                <span>响应中..</span>
              </span>
              <span v-else>以上内容为 AI 生成，不代表开发者立场</span>
              <div class="btns" v-if="r.thinking == false">
                <QuotationSource :docs="r.doc" v-if="!isEmpty(r.doc)"></QuotationSource>
                <el-button :icon="Refresh" round @click="reAnswer(r)"
                  v-if="index == session.records.length - 1">重新生成</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <el-alert :title="blankTip" type="warning" class="record blank-tip" show-icon :closable="false" />
      </template>
    </div>

    <ChatInput v-model="param.query" :replying="replying" :disabled="replying" :autofocus="true"
      :show-recommend="true" :placeholder="replying ? REPLAYING : INPUT_TIP" :param="param"
      @send="ask" @abort="abort"></ChatInput>
  </div>
</template>
<!-- 由于在setup组合式API中没有onBeforeRouteEnter, 因此当前组件采用两种结合的方式。
     注意: 两个script数据并不相通。选项式script里只做路由进入、离开时对store中session的添加或移除的动作
-->
<script lang="ts">
import { RequestParam } from "@/views/chat2llm/model";
export default {
  beforeRouteEnter(to: any, from: any) {
    const sessionStore = useChatSessions();
    const { params: { sessionId }, query: { knowledgeName, query = '' } } = to;
    if (isEmpty(sessionId)) {
      return { name: 'home' }; // 回主页
    }
    // @ts-ignore
    let session: ChatSession | any = sessionStore.get(sessionId);
    if (isEmpty(session)) { // 如果会话不存在，则新建一个会话
      const chatMode = isEmpty(knowledgeName) ? ChatMode.LLM : ChatMode.Knowledge;
      // @ts-ignore
      const param = new RequestParam(chatMode, query, knowledgeName);
      // @ts-ignore
      session = new ChatSession(sessionId, chatMode, param);
      sessionStore.put(session);
    }
  }
}
</script>

<script lang="ts" setup>
import { computed, onMounted, ref, reactive, type Ref } from "vue";
import { onBeforeRouteLeave } from 'vue-router';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatMode, Who, ChatSession, ChatRecord } from "./model";
import { Loading, Refresh } from "@element-plus/icons-vue";
import { fetchStream } from "./fetchStream";
import 'highlight.js/styles/atom-one-dark-reasonable.css'
import { isEmpty } from "lodash";
import ChatInput from "@/components/chatinput/ChatInput.vue";
import QuotationSource from "./QuotationSource.vue";
import { INPUT_TIP, REPLAYING } from "@/constant";
import { useChatSessions } from "@/stores/chatSessions";
import { useKnowledgeStore } from "@/stores/knowledge";
import { saveSession } from "@/api/session";
import { loadHistories } from "@/api/history";
import markdown from "./markdown";

const props = defineProps({
  sessionId: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: false
  }
})

const replying = ref(false); // 回答中
const hasMoreHistory = ref(true); // 是否有更多未加载的聊天记录

// 从pinia中获取知识库
const kbStore = useKnowledgeStore();
// 从pinia中获取session
const sessionStore = useChatSessions();
// @ts-ignore
const session: Ref<ChatSession> = ref(sessionStore.get(props.sessionId));
const param = session.value.param;
let ctrl: AbortController; // 控制sse停止

// 进入时
onMounted(async () => {
  await loadHistory(null, 2) // 默认加载最新的2轮对话记录。可手动往前翻历史记录
  if (!isEmpty(param.query)) { // 进入时带了内容，则直接发问
    ask()
  }
})

const blankTip = computed(() => {
  const {mode, param: { knowledge_base_name }} = session.value;
  let tip;
  if (mode == ChatMode.Knowledge) {
    const kb = kbStore.get(knowledge_base_name ?? '')
    tip = `您当前正处于知识库(${kb?.kb_zh_name})中, 知识库介绍: ${kb?.kb_info} 请咨询相关内容`;
  } else {
    tip = '您当前正处于非知识库模式中';
  }
  return `${tip}。请注意: AI答复不保证准确性, 请自行甄别。`
})

/**
 * 发起提问
 */
function ask() {
  const { query = '' } = param;
  if (isEmpty(query.trim())) {
    return;
  }

  session.value.fillHistory(); // 历史记录带上
  session.value.addQuestion(new ChatMessage(uuidv4().replaceAll('-', ''), query));
  clearQuery();
  answer(query);
}

/**
 * 重新回答
 */
function reAnswer(record: ChatRecord) {
  const latestAnswer = session.value.getLatestRecord()
  if (latestAnswer?.chat_history_id != record.chat_history_id) {
    return // 只有最后一条回答才能允许重新生成
  }
  const latestQuestion = session.value.getLatestRecord(2) // 此时获取的最后一条就是需要重新回答的问题
  answer(latestQuestion?.messageHtml, latestAnswer)
}

// 主动终止响应
function abort() {
  if (ctrl != undefined) {
    ctrl.abort();
  }
}

// 回答：发起调用并解析。query为问题内容，record不为空则表示重新生成(record为需要重新生成的回答记录)
async function answer(query?: string, r?: ChatRecord) {
  let record: ChatRecord;
  if (isEmpty(r)) { // 新生成的回答
    record = reactive(new ChatRecord(Who.robot, uuidv4().replaceAll('-', '')));
    session.value.addAnswer(record)
  } else {
    record = r
  }
  record.clear()
  record.thinking = true

  ctrl = await fetchStream(session.value.mode, {
    session_id: session.value.sessionId,
    ...param,
    query,
    chat_history_id: r?.chat_history_id // 这里必须取入参的r
  }, {
    onopen: function (/*res: Response*/) {
      replying.value = true;
    },
    onmessage: function (msgs: ChatMessage[]) {
      console.log('onmessage..')
      msgs.forEach(msg => {
        msg.chat_history_id = record.chat_history_id;
        record.addMessage(msg)
      });
    },
    ondone: function () {
      console.log('ondone..')
      replying.value = false;
      record.thinking = false;
      if (record.isEmpty()) { // 没有此次对话记录，说明有问题，给出错误
        // TODO 因为当有记性时(>0)，后端会发生一个错误. issue: https://github.com/chatchat-space/Langchain-Chatchat/issues/2228
        // 因此会导致此问题, 但是发现，如果调整下history，又恢复了。所以这里将记性默默调整下, 避免导致后面始终报这个错。这是临时不可取的方案，等这个issue解决了，再进行修改。
        param.history_count = param.history_count ?? 5;
        if (param.history_count > 5) {
          param.history_count = param.history_count - 1;
        } else {
          param.history_count = param.history_count + 1;
        }
        record.setError(new Error('抱歉, 走神了. 请再问一次.'));
      }
    },
    onerr: function (err) {
      replying.value = false;
      record.thinking = false
      if (err instanceof DOMException && err.name == 'AbortError') {
        // 主动终止响应..
        console.log('手动终止: ' + err.message);
        return;
      }
      record.setError(err)
      console.error(err);
    }
  });
}

// 清除输入项
function clearQuery() {
  param.query = '';
}

/**
 * 加载指定记录的前num轮对话记录
 * @param chatId 参考的记录id, 如果为空，则取当前session中最早的
 * @param num    基于参考的记录id的前num条记录
 */
async function loadHistory(chatId?: string | null | undefined, num?: number) {
  if (isEmpty(chatId)) {
    const chatRecord = session.value.getEarliestRecord()
    chatId = chatRecord?.chat_history_id 
  }
  const res = await loadHistories(session.value.sessionId, chatId, num)
  const data = res.data
  if (isEmpty(data)) {
    hasMoreHistory.value = false
    return
  }
  // 每个item是一轮对话，即包含一问一答
  data.forEach(item => {
    const { id, query, response, docs = [], create_time } = item
    const a: ChatRecord = new ChatRecord(Who.robot, id)
    a.doc = docs.map(doc => new ChatMessage(id, doc))
    a.messageHtml = markdown.render(response)
    a.create_time = create_time
    session.value.unshift(a)

    const q: ChatRecord = new ChatRecord(Who.you, id)
    q.messageHtml = query
    q.create_time = create_time
    session.value.unshift(q)
  })
}

onBeforeRouteLeave(() => {
  autoSave()
})


/**
 * 注册页面关闭的动作
 * @param e 
 */
window.addEventListener('beforeunload', (e) => {
  autoSave()
})

/**
 * 自动保存当前会话
 */
function autoSave() {
  if (session.value.isEmpty()) {  // 如果会话为空, 则移除
    sessionStore.remove(session.value.sessionId)
  } else {
    // 持久化会话
    saveSession(session.value).then(({ data: result}) => {
      if (result == false) {
        return
      }
    })
  }
}
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
  
    & > .load-more {
      text-align: center;
    }

    // $avatarSide: 2rem;

    &>.record {
      display: flex;
      align-items: flex-start;
      overflow: hidden;
      padding: 0.8rem;

      .avatar {
        display: inline-block;
        text-align: center;
        // width: $avatarSide;
        // height: $avatarSide;
      }

      .message {
        // flex: 1;
        border-radius: 1rem;
        padding: 0.8rem;
        overflow: auto;

        &>.text {
          max-width: 100%;
        }

        &>.opr {
          display: flex;
          align-items: center;
          font-size: 0.6rem;
          color: rgb(154, 154, 154);
          border-top: 1PX solid rgb(233, 233, 233);
          margin-top: 0.5rem;

          &> :first-child {
            flex: 1;
          }

          .btns {
            display: flex;
            & > * {
              margin: 0 0.2rem;
            }
          }
        }
      }
    }

    .you {
      flex-direction: row-reverse;

      .message {
        // margin-left: $avatarSide;
        margin-right: 0.2rem;
        text-align: right;
        color: #fff;
        background-color: #0098ff;
        border-bottom-right-radius: 0;

        &>.text {
          display: inline-block;
          text-align: left;
        }
      }
    }

    .robot {
      text-align: left;

      .message {
        // margin-left: 0.2rem;
        // margin-right: $avatarSide;
        border: 1px solid #eaeaea;
        background-color: #fff;
        color: black;
        border-bottom-left-radius: 0;

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
