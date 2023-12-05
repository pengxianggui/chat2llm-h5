<template>
  <div class="sessions">
    <el-icon size="1.4rem" @click="visible = true">
      <ChatLineRound />
    </el-icon>
    <el-drawer v-model="visible" direction="ltr" size="80%" class="drawer" :append-to-body="false"
      :show-close="true">
      <template #header>
        <div>对话历史</div>
      </template>

      <ul class="session-list">
        <li v-for="s in bucket" :key="s.sessionId" @click="toChat(s.sessionId)">
          <!-- TODO 1.改名; 2. 删除 -->
          <h4>{{ s.sessionName }}</h4>
          <el-tag v-if="s.param.mode == ChatMode.Knowledge" size="small">
            {{ getKbZhName(s.sessionId, s.param.knowledge_base_name) }}
          </el-tag>
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
import { useKnowledgeStore } from "@/stores/knowledge";
import { isEmpty } from "lodash";

const router = useRouter();

const store = useChatSessions();

const bucket = ref(store.bucket);
const visible = ref(false);

function toChat(sessionId: string) {
  router.push(`/chat/${sessionId}`)
}

function getKbZhName(sessionId: string, kbName: string) {
  if (!isEmpty(kbName)) {
    // 从pinia中获取知识库详情
    const kbStore = useKnowledgeStore();
    const kb = kbStore.knowledges.find(kb => kb.kb_name === kbName)
    return kb?.kb_zh_name
  }

  return '随便聊';
}
</script>

<style scoped lang="scss">
.sessions {
  display: flex;
  align-items: center;

  .session-list {
    list-style: none;
    background-color: #f6f6f6;
    padding: 0;
    border-radius: 1rem;
    overflow: hidden;

    li {
      $topPadding: 0.8rem;
      position: relative;
      padding: $topPadding 1rem 0 $topPadding;
      font-size: 0.8rem;
      color: #555555;
      cursor: pointer;

      &:hover {
        background-color: #cacaca;
      }

      h4 {
        overflow: hidden;
        white-space: nowrap;
        font-weight: bold;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
      }

      &::after {
        content: '';
        display: block;
        border-bottom: 1px solid rgb(229, 229, 229);
        margin-top: $topPadding;
        
      }
    }
  }
}
</style>
