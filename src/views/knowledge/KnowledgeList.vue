<template>
    <div class="knowledges">
        <el-card class="knowledge" v-for="name in knowledges" :key="name" shadow="never" @click="toChat(name)">
            <template #header>
                <h4>{{ name }}</h4>
            </template>
            <span>介绍介绍介绍</span>
        </el-card>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import router from "@/router";
import { getNames } from '@/api/knowledge';
import { ChatMode } from '../chat2llm/model';

const knowledges = ref([] as Array<string>)

onBeforeMount(() => {
    getNames().then(({ data }) => {
        knowledges.value = data;
    })
})

function toChat(knowledgeName: string) {
    // 新开一个chat session
    const sessionId = uuidv4();
    router.push({
        path: `chat/${sessionId}`,
        query: {
            chatMode: ChatMode.Knowledge,
            knowledgeName: knowledgeName
        }
    })
}
</script>
<style scoped lang="scss">
.knowledges {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    grid-gap: 0.5rem;

    .knowledge {
        // height: 4rem;

        :deep(.el-card__header) {
            padding: 0.1rem 1rem;

            h4 {
                font-weight: bold;
            }
        }

        :deep(.el-card__body) {
            padding: 1rem;
            max-height: 5rem;
        }
    }
}
</style>