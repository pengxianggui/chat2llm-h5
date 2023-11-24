<template>
  <div class="main">
    <div class="history">
      <div v-for="(r) in records" :key="r.chat_history_id" class="record" :class="r.who">
        <span class="avatar">{{ r.avatar }}</span>
        <div class="message">
          <div v-html="r.renderHtml" class="text"></div>
        </div>
      </div>
    </div>
    <div class="input">
      <input type="text" :placeholder="replying ? '响应中..' : '输入对话内容'" v-model="param.query"
             @keyup.enter="ask" :disabled="replying">
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {v4 as uuidv4} from 'uuid'; // 如果使用ES6模块
import {ChatMessage, ChatRecord, RequestParam, Who} from "./model";
import {fetchStream} from "./fetchStream";
import markdown from "./markdown";
import 'highlight.js/styles/atom-one-dark-reasonable.css'

const param = ref(new RequestParam());
const records = ref([] as ChatRecord[]);
const replying = ref(false);

function ask() {
  const {query} = param.value;
  addQuestion(new ChatMessage(uuidv4(), query));
  fetchAndParse(query);
}

// 发起调用并解析
function fetchAndParse(query: string) {
  fetchStream({
    ...param.value,
    query
  }, {
    onopen: function (/*res*/) {
      replying.value = true;
    },
    onmessage: function (msgs: ChatMessage[]) {
      msgs.forEach(msg => addAnswer(msg));
    },
    ondone: function () {
      replying.value = false;
    },
    onerr: function (err) {
      replying.value = false;
      addError(err)
    }
  })
}

// 添加提问记录
function addQuestion(message: ChatMessage) {
  const {chat_history_id} = message;
  const record = new ChatRecord(Who.you, '👥', [message], chat_history_id);
  record.renderHtml = message.text;
  records.value.push(record);
  param.value.query = '';
}

// 添加回答记录
function addAnswer(message: ChatMessage) {
  const {chat_history_id} = message;
  let r = records.value.find(r => r.chat_history_id === chat_history_id);
  if (r) {
    r.messages.push(message);
  } else {
    r = new ChatRecord(Who.robot, '🤖', [message], chat_history_id);
    records.value.push(r);
  }
  const messageText = r.messages.map(msg => msg.text).join("");
  r.renderHtml = markdown.render(messageText);
}

// 发生错误时清空消息，并将错误信息提示出来
function addError(err: Error) {
  const r = records.value.findLast(r => r.who === Who.robot);
  r.messages.length = 0; // clear
  r.renderHtml = err.message
}
</script>

<style lang="scss">
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f8f8;

  & > .history {
    flex: 1;
    overflow: hidden auto;
    height: calc(100% - 160px);
    background-color: #f6f6f6;

    $avatarSide: 2rem;

    & > .record {
      display: flex;
      align-items: flex-start;
      overflow: hidden;

      .avatar {
        display: inline-block;
        text-align: center;
        border-radius: 5px;
        width: $avatarSide;
        height: $avatarSide;
      }

      .message {
        flex: 1;
        width: 0;

        & > .text {
          max-width: 100%;
          border-radius: 10px;
          padding: 15px;
        }
      }
    }

    .you {
      flex-direction: row-reverse;
      padding: 10px;

      .message {
        margin-left: $avatarSide;
        margin-right: 5px;
        text-align: right;

        & > .text {
          display: inline-block;
          background-color: #94ea69;
          text-align: left;
        }
      }
    }

    .robot {
      text-align: left;
      padding: 10px;

      .message {
        margin-left: 5px;
        margin-right: $avatarSide;

        & > .text {
          display: inline-block;
          background-color: #ffffff;
        }
      }
    }

  }

  & > .input {
    padding: 0.3rem 1rem;
    height: 3rem;
    background-color: #fff;
    display: flex;

    input {
      width: 100%;
      box-sizing: border-box;
      border: none;
      outline: none;
      font-size: 1.2rem;
    }
  }
}
</style>
