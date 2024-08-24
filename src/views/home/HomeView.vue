<template>
  <div class="home">
    <div class="body">
      <!-- 知识库版块列表 -->
      <KnowledgeList :limit="6"></KnowledgeList>
      <AskRecomment></AskRecomment>
    </div>

    <!-- 对话输入框，支持语音输入 -->
    <ChatInput id="chat-input" @focus="chat2llm" :placeholder="INPUT_TIP"></ChatInput>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { ChatMode } from '@/views/chat2llm/model'
import { INPUT_TIP } from '@/constant'
import { isEmpty } from 'lodash'
import KnowledgeList from '../knowledge/KnowledgeList.vue'
import AskRecomment from '../recommend/AskRecommend.vue'
import ChatInput from '@/components/chatinput/ChatInput.vue'
import { generateUUID } from '@/utils/str-util'

function chat2llm(sessionId?: String) {
  if (isEmpty(sessionId)) {
    sessionId = generateUUID();
  }
  router.push({
    path: `/chat/${sessionId}`,
    query: {
      chatMode: ChatMode.LLM
    }
  })
}

</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  flex-flow: column;
  min-height: 0;

  .body {
    flex: 1;
    padding: 1rem;
    overflow: auto;
  }

  // #chat-input {
  //   position: absolute;
  //   bottom: 0;
  //   width: 100%;
  // }
}
</style>
