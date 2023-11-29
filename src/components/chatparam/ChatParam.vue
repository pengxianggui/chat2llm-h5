<template>
    <div class="param-config">
        <el-button class="setting" :icon="Setting" circle size="large" @click="visible = true"></el-button>

        <el-drawer v-model="visible" direction="rtl" size="60%" class="session-drawer" :append-to-body="false"
            :show-close="true">
            <template #header>
                <div>参数配置</div>
            </template>
            <!-- form -->
            <el-form :model="chatParam">
                <el-form-item prop="mode" label="对话模式">
                    <h4>{{ chatParam.mode == ChatMode.LLM ? '非知识库模式' : '知识库模式' }}</h4>
                </el-form-item>
                <el-form-item prop="knowledge_base_name" label="知识库名" v-if="chatParam.mode == ChatMode.Knowledge">
                    <h4>{{ chatParam.knowledge_base_name }}</h4>
                </el-form-item>
                <el-form-item prop="temperature" label="历史对话轮数">
                    <!-- <el-slider v-model="chatParam.temperature" :min="0" :max="1" /> -->
                </el-form-item>
                <el-form-item prop="temperature" label="温度">
                    <el-slider v-model="chatParam.temperature" :min="0" :max="1" :step="0.1" />
                </el-form-item>
                <el-form-item prop="top_k" label="匹配知识条数" v-if="chatParam.mode == ChatMode.Knowledge">
                    <el-slider v-model="chatParam.top_k" :min="1" :max="10" :step="1" />
                </el-form-item>
                <el-form-item prop="score_threshold" label="知识匹配分数阈值" v-if="chatParam.mode == ChatMode.Knowledge">
                    <el-slider v-model="chatParam.score_threshold" :min="0" :max="2" :step="0.1" />
                </el-form-item>
            </el-form>
            <!-- {{ chatParam }} -->
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Setting } from "@element-plus/icons-vue";
import { ChatMode } from "@/views/chat2llm/model";
import { useChatSessions } from "@/stores/chatSessions";

const props = defineProps({
    sessionId: {
        type: String,
        require: true
    }
});

 // 从pinia中获取session
 const sessionStore = useChatSessions();
// @ts-ignore
const session: Ref<ChatSession> = ref(sessionStore.get(props.sessionId));
const chatParam = session.value.param;
const visible = ref(false);

</script>