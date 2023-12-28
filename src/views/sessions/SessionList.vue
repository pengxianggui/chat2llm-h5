<template>
  <div>
    <h4 class="title">
        <span>对话历史</span>
        <el-link type="primary" @click="editable = !editable">{{ editable ? '完成' : '编辑'}}</el-link>
    </h4>
    <ul class="session-list">
      <li class="session" v-for="s in bucket" :key="s.sessionId">
        <div class="session-info"  @click="toChat(s.sessionId)">
          <h4>{{ s.sessionName }}</h4>
          <div class="sub">
            <el-tag v-if="s.mode == ChatMode.Knowledge" size="small">
              {{ getKbZhName(s.sessionId, s.param.knowledge_base_name) }}
            </el-tag>
            <span>{{ s.create_time }}</span>
          </div>
        </div>
        <el-button class="session-btn" link @click="removeSession(s.sessionId)" v-if="editable">
          <el-icon :size="20">
            <Delete></Delete>
          </el-icon>
        </el-button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router'
import { useChatSessions } from "@/stores/chatSessions.ts";
import { ChatMode } from "@/views/chat2llm/model";
import { useKnowledgeStore } from "@/stores/knowledge";
import { isEmpty } from "lodash";
import { Delete } from "@element-plus/icons-vue";
import { deleteSession } from "@/api/session.ts"

const router = useRouter();
const store = useChatSessions();
const bucket = ref(store.bucket);

const editable = ref<Boolean>(false)

function toChat(sessionId: string) {
  router.push(`/chat/${sessionId}`)
}

function getKbZhName(sessionId: string, kbName: string | undefined) {
  if (!isEmpty(kbName)) {
    // 从pinia中获取知识库详情
    const kbStore = useKnowledgeStore();
    const kb = kbStore.knowledges.find(kb => kb.kb_name === kbName)
    return kb?.kb_zh_name
  }

  return '随便聊';
}

function removeSession(sessionId: string) {
  deleteSession(sessionId).then(() => {
    store.remove(sessionId)
  })

}
</script>

<style scoped lang="scss">
.title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}
.session-list {
  list-style: none;
  padding: 0;
  overflow: hidden;

  li.session {
    $topPadding: 0.8rem;
    position: relative;
    // padding: $topPadding 1rem 0 $topPadding;
    font-size: 0.8rem;
    color: #555555;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .session-info {
      background-color: #f6f6f6;
      padding: 0.5rem;
      border-radius: 1rem;
      margin-bottom: 0.5rem;
      flex: 1;
        
      h4 {
        overflow: hidden;
        white-space: nowrap;
        font-weight: bold;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        margin: 0.2rem 0;
      }

      .sub {
        display: flex;
        justify-content: space-between;
        color: rgb(188, 188, 188);
      }
    }

    .session-btn {
      margin-left: 1rem;
    }
  }
}
</style>
