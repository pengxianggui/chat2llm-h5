<template>
    <div class="knowledges">
        <el-card class="knowledge" v-for="kb in knowledges" :key="kb.kb_name" shadow="always" @click="toChat(kb.kb_name)">
            <template #header>
                <h4>
                    <span>📒</span>&nbsp;
                    <span>{{ kb.kb_zh_name }}</span>
                </h4>
            </template>
            <span>{{ kb.kb_info }}</span>
        </el-card>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import router from "@/router";
import { useKnowledgeStore } from '@/stores/knowledge.ts'

const kbStore = useKnowledgeStore();

const knowledges = computed(() => {
    return kbStore.knowledges;
})

function toChat(knowledgeName: string) {
    // 新开一个chat session
    const sessionId = uuidv4();
    router.push({
        path: `/chat/${sessionId}`,
        query: {
            knowledgeName: knowledgeName
        }
    })
}
</script>
<style scoped lang="scss">
$color-array: rgb(223, 180, 180), rgb(195, 195, 234), rgb(194, 230, 194), rgb(209, 209, 173), rgb(242, 187, 242);

.knowledges {
    display: grid;
    // grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5rem;

    @each $color in $color-array {
        $i: index($color-array, $color);
        .knowledge:nth-child(#{$i}) {
            background-color: $color;
        }
    }


    .knowledge {
        // height: 4rem;
        cursor: pointer;
        border-radius: 1rem;

        :deep(.el-card__header) {
            padding: 0.5rem 1rem;

            h4 {
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
        }

        :deep(.el-card__body) {
            padding: 1rem;
            font-size: 0.8rem;
        }
    }
}
</style>