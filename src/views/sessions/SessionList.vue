<template>
  <div class="sessions">
    <el-button class="session-btn" :icon="ChatLineRound" circle size="large" @click="visible=true"></el-button>
    <el-drawer v-model="visible" direction="ltr" size="60%" class="session-drawer"
               :append-to-body="false" :show-close="true">
      <template #header>
        <div>对话历史</div>
      </template>

      <ul class="session-list">
        <li v-for="s in bucket" :key="s.sessionId">
          <!-- TODO 1.改名; 2. 删除 -->
          <router-link :to="`/chat/${s.sessionId}`">{{ s.sessionName }}</router-link>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {ChatLineRound} from "@element-plus/icons-vue";
import {useChatSessions} from "@/stores/chatSessions.ts";

const store = useChatSessions();

const bucket = ref(store.bucket);
const visible = ref(false)
</script>

<style scoped lang="scss">
.session-list {
  list-style: none;
  padding: 0;

  li {
    overflow:hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow:ellipsis;
    padding: 0.2rem 0;
    a {
      color: #9f9f9f;
    }
  }
}
</style>
