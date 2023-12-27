<template>
    <div class="recommend">
        <div class="head">
            <svg-icon value="star" size="1.5rem"></svg-icon>
            <span>试着问我</span>
            <span class="flex"></span>
            <el-button type="text">
                <svg-icon value="refresh" size="1.2rem"></svg-icon>
                <span>换一换</span>
            </el-button>
        </div>
        <div class="content">
            <ul v-if="recommendQuestion.length > 0">
                <li v-for="(q, index) in recommendQuestion" :key="index">
                    <el-link @click="toChat(q.query, q.knowledgeName)">{{ q.query }}</el-link>
                </li>
            </ul>
            <svg-icon value="empty" v-else size="100%"></svg-icon>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ref } from 'vue';
import router from "@/router";
import type { RecommendQustion } from './model';
import { getRecommendQuestion } from '@/api/recommend';

const recommendQuestion = ref<Array<RecommendQustion>>([]);
initData();

/**
 * 初始化数据
 */
function initData() {
    getRecommendQuestion(6).then(({data}) => {
        recommendQuestion.value = data
    })
}

/**
 * 携带问题前往对话界面。若knowledgeName为空，则表示采用llm模式，否则采用知识库模式
 */
function toChat(query: String, knowledgeName?: String) {
    // 新开一个chat session
    const sessionId = uuidv4().replaceAll('-', '');
    router.push({
        path: `/chat/${sessionId}`,
        query: {
            query: query,
            knowledgeName: knowledgeName
        }
    })
}
</script>

<style scoped lang="scss">
.recommend {
    padding: 1rem 0;
    
    .head {
        margin: 0.5rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .flex {
            flex: 1;
        }
        .svg-icon {
            margin-right: 0.3rem;
        }
    }

    .content {
        background: white;
        padding: 1rem;
        border-radius: 1rem;

        ul {
            list-style: none;
            padding: 0;
            font-family: PingFangSC;
            font-weight: 400;
            color: rgb(16, 16, 16);
            font-style: normal;
            li {
                margin: 0.3rem 0;
            }
        }
    }
}
</style>