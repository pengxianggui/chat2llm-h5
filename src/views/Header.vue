<template>
  <div class="header">
    <div class="left">
      <el-button class="back" :icon="Back" circle size="large" @click="router.back()"
        v-if="route.meta.showBack"></el-button>
      <SessionList v-else></SessionList>
    </div>

    <div class="title">
      <span>{{ route.meta.title }}</span>&nbsp;
      <el-tag type="info" v-if="sessionId && session.param.mode == ChatMode.Knowledge">{{ session.param.knowledge_base_name }}</el-tag>
    </div>

    <div class="right">
      <ChatParam v-if="sessionId" :session-id="sessionId"></ChatParam>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { Back } from '@element-plus/icons-vue'
import SessionList from "@/views/sessions/SessionList.vue";
import { watch, ref } from "vue";
import { useChatSessions } from "@/stores/chatSessions";
import { computed } from "vue";
import { ChatMode } from "./chat2llm/model";

const route = useRoute();
const router = useRouter();
const sessionId = ref(route.params.sessionId);

// important! 保证sessionId值同步取值当前路由path中的sessionId
watch(
  () => route,
  () => {
    sessionId.value = route.params.sessionId;
  },
  { immediate: true, deep: true }
);

const session = computed(() => {
    // 从pinia中获取session
    const sessionStore = useChatSessions();
    // @ts-ignore
    return sessionStore.get(sessionId.value);
})
</script>

<style scoped lang="scss">
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;

  .title {
    font-weight: bold;
  }

  :deep(.el-overlay) {
    position: absolute;
  }
}
</style>
