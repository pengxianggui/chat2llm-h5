<template>
  <div class="header">
    <el-icon size="1.4rem" @click="router.back()" v-if="route.meta.showBack">
      <Back />
    </el-icon>
    <SessionList v-else></SessionList>

    <h4 class="title">{{ title }}</h4>

    <ChatParam v-if="sessionId" :session-id="sessionId"></ChatParam>
    <span v-else></span>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { Back } from '@element-plus/icons-vue'
import SessionList from "@/views/sessions/SessionList.vue";
import { watch, ref } from "vue";
import { useKnowledgeStore } from "@/stores/knowledge";
import { useChatSessions } from '@/stores/chatSessions';
import { computed } from "vue";
import { isEmpty } from "lodash";

const route = useRoute();
const router = useRouter();
const sessionId = ref(route.params.sessionId);
const knowledgeName = ref(route.query.knowledgeName)

// important! 保证sessionId值同步取值当前路由path中的sessionId
watch(
  () => route,
  () => {
    sessionId.value = route.params.sessionId;
    knowledgeName.value = route.query.knowledgeName
  },
  { immediate: true, deep: true }
);

const title = computed(() => {
  if (!isEmpty(sessionId.value)) {
    const sessionStore = useChatSessions();
    const session = sessionStore.get(sessionId.value);
    const { param: { knowledge_base_name } } = session
    if (isEmpty(knowledge_base_name)) {
      return route.meta.title;
    }
    // 从pinia中获取知识库详情
    const kbStore = useKnowledgeStore();
    const kb = kbStore.knowledges.find(kb => kb.kb_name === knowledge_base_name)
    return kb?.kb_zh_name
  }

  return route.meta.title;
})
</script>

<style scoped lang="scss">
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 1rem;

  .title {
    font-weight: bold;
  }

  :deep(.el-overlay) {
    position: absolute;
  }
}
</style>
