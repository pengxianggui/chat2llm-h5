<template>
  <div class="header">
    <el-icon size="1.4rem" @click="back" v-if="route.meta.showBack">
      <Back />
    </el-icon>

    <h4 :class="{'title': true, 'home-hight': isHome}">
      <img class="logo" src="../assets/img/logo.png" alt="" v-if="isHome">&nbsp;
      <span>{{ title }}</span>
    </h4>

    <ChatParam v-if="sessionId" :session-id="sessionId"></ChatParam>
    <UserProfile v-else></UserProfile>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { Back } from '@element-plus/icons-vue'
import UserProfile from "@/views/profile/UserProfile.vue"
import { watch, ref } from "vue";
import { useKnowledgeStore } from "@/stores/knowledge";
import { useChatSessions } from '@/stores/chatSessions';
import { computed } from "vue";
import { isEmpty } from "lodash";

const route = useRoute();
const router = useRouter();
const sessionId = ref(route.params.sessionId);
const knowledgeName = ref(route.query.knowledgeName)

const isHome = computed(() => {
  return route.name === 'home'
})

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
    // @ts-ignore
    const session = sessionStore.get(sessionId.value);
    const knowledgeName = session?.param?.knowledge_base_name ?? ''
    if (isEmpty(knowledgeName)) {
      return route.meta.title;
    }
    // 从pinia中获取知识库详情
    const kbStore = useKnowledgeStore();
    const kb = kbStore.get(knowledgeName)
    return kb?.kb_zh_name
  }

  return route.meta.title;
})

function back() {
  router.push({
    path: '/home'
  })
}
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
    display: flex;
    align-items: center;
    .logo {
      height: 1.5rem;
    }
  }
  .title.home-hight {
    color: #005aff;
    font-size: 1.3rem;
  }
}
</style>
