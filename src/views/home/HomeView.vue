<template>
  <div class="home">
    <div class="body">
      <!-- 知识库版块列表 -->
    </div>

    <!-- 对话输入框，支持语音输入 -->
    <ChatInput @focus="chat2llm" :placeholder="INPUT_TIP"></ChatInput>
  </div>
</template>

<script setup lang="ts">
import {v4 as uuidv4} from 'uuid'; // 如果使用ES6模块
import router from "@/router";
import {RequestParam} from "@/views/chat2llm/model";
import {INPUT_TIP} from "@/constant";
import {isEmpty} from "lodash";

function chat2llm(sessionId?: String, params?: RequestParam) {
  if (isEmpty(sessionId)) {
    sessionId = uuidv4()
  }
  router.push({
    name: `chat`,
    params: {
      ...params,
      sessionId: sessionId
    },
  })
}

</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;

  .body {
    flex: 1;
  }
}
</style>
