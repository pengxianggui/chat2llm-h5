<template>
  <div class="sessions">
    <el-button class="session-btn" :icon="ChatLineRound" circle size="large" @click="visible = true"></el-button>
    <el-drawer v-model="visible" direction="ltr" size="70%" class="session-drawer" :append-to-body="false"
      :show-close="true">
      <template #header>
        <div>对话历史</div>
      </template>

      <ul class="session-list">
        <li v-for="s in bucket" :key="s.sessionId" @click="toChat(s.sessionId)">
          <!-- TODO 1.改名; 2. 删除 -->
          <h4>{{ s.sessionName }}</h4>
          <el-tag v-if="s.param.mode == ChatMode.Knowledge">{{ s.param.knowledge_base_name }}</el-tag>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router'
import { ChatLineRound } from "@element-plus/icons-vue";
import { useChatSessions } from "@/stores/chatSessions.ts";
import { ChatMode } from "@/views/chat2llm/model";

const router = useRouter();

const store = useChatSessions();

const bucket = ref(store.bucket);
const visible = ref(false);

function toChat(sessionId: string) {
  router.push(`/chat/${sessionId}`)
}
</script>

<style scoped lang="scss">
.session-list {
  list-style: none;
  background-color: #f6f6f6;
  padding: 0;
  border-radius: 1rem;
  overflow: hidden;

  li {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    color: #555555;
    cursor: pointer;

    &:hover {
      background-color: #cacaca;
    }

    h4 {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
    }
  }
}
</style>
