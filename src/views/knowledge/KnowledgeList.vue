<template>
  <div id="knowledges" class="knowledges">
    <el-card class="knowledge" v-for="(kb, index) in knowledges" :key="kb.kb_name" shadow="always"
             :style="`background:` + bgColorArr[index % (bgColorArr.length)]"
             @click="toChat(kb)">
      <!-- <template #header> -->
      <h3>
        <!-- <span>📒</span>&nbsp; -->
        <span v-ellipsis="1">{{ kb.kb_zh_name }}</span>
      </h3>
      <!-- </template> -->
      <!-- <span  v-ellipsis="1">{{ kb.kb_info }}</span> -->
      <span>去体验 ></span>
    </el-card>
    <svg-icon value="empty" v-if="knowledges.length == 0" size="100%"></svg-icon>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import router from '@/router'
import { useKnowledgeStore } from '@/stores/knowledge'
import { ChatMode, Knowledge } from '@/views/chat2llm/model'
import { generateUUID } from '@/utils/str-util'

const props = defineProps({
  limit: {
    type: Number,
    required: false
  }
})

const bgColorArr = ref<Array<String>>([
  'linear-gradient(45deg, #7fe9fe, #23bdff)',
  'linear-gradient(45deg, #fac1cf, #fe89ad)',
  'linear-gradient(45deg, #cbfaa7, #5ffba9)',
  'linear-gradient(45deg, #d6ceff, #afaaff)',
  'linear-gradient(45deg, #fffdd9, #fffdd9)'])

const kbStore = useKnowledgeStore()

const knowledges = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return kbStore.knowledges.slice(0, props.limit)
})

function toChat(kb: Knowledge) {
  // 新开一个chat session
  const sessionId = generateUUID();
  router.push({
    path: `/chat/${sessionId}`,
    query: {
      chatMode: ChatMode.Knowledge,
      knowledgeId: kb.kb_id
    }
  })
}

</script>
<style scoped lang="scss">

.knowledges {
  display: grid;
  // grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;

  .knowledge {
    // height: 4rem;
    cursor: pointer;
    border-radius: 1rem;

    // :deep(.el-card__header) {
    //     padding: 0.5rem 1rem;

    h3 {
      display: flex;
      align-items: center;
      word-break: keep-all;

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;

      & * {
        font-weight: bold;
      }
    }

    // }

    :deep(.el-card__body) {
      padding: 1rem;
      font-size: 0.8rem;
    }
  }
}
</style>