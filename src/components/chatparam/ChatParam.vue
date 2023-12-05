<template>
    <div class="param-config">
        <el-icon size="1.4rem" @click="visible = true">
            <Setting />
        </el-icon>

        <el-drawer v-model="visible" direction="rtl" size="80%" class="session-drawer" :append-to-body="false"
            :show-close="true">
            <template #header>
                <div>参数配置</div>
            </template>
            <!-- form -->
            <el-form :model="chatParam" label-width="auto" label-suffix=":">
                <el-form-item prop="mode" label="模式">
                    <h4>{{ chatParam.mode == ChatMode.LLM ? '非知识库模式' : '知识库模式' }}</h4>
                </el-form-item>
                <el-form-item prop="temperature" label="记性">
                    <el-slider v-model="chatParam.history_count" :min="0" :max="10" />
                </el-form-item>
                <el-form-item prop="temperature" label="温度" v-if="chatParam.mode == ChatMode.LLM">
                    <el-slider v-model="chatParam.temperature" :min="0" :max="1" :step="0.01" />
                </el-form-item>
                <div  v-if="chatParam.mode == ChatMode.Knowledge">
                    <el-divider content-position="left">知识库相关</el-divider>
                    <el-form-item prop="knowledge_base_name" label="知识库名">
                        <h4>{{ chatParam.knowledge_base_name }}</h4>
                    </el-form-item>
                    <el-form-item prop="top_k" label="匹配条数">
                        <el-slider v-model="chatParam.top_k" :min="1" :max="10" :step="1" />
                    </el-form-item>
                    <el-form-item prop="score_threshold" label="匹配阈值" v-if="chatParam.mode == ChatMode.Knowledge">
                        <el-slider v-model="chatParam.score_threshold" :min="0" :max="2" :step="0.1" />
                    </el-form-item>
                </div>
            </el-form>
            <!-- {{ chatParam }} -->
            <el-alert title="消息提示的文案" type="info" :closable="false">
                1. 记性: 模型能记住的最近对话记录的条数。<br>
                2. 温度: 
            </el-alert>
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

<style scoped lang="scss">
.param-config {
  display: flex;
  align-items: center;
}
</style>