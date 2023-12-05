<template>
    <div>
        <el-button :icon="InfoFilled" circle @click="visible = true"></el-button>
        <el-drawer v-model="visible" direction="btt" size="60%" :append-to-body="false" 
            :show-close="false" title="AI回复引用出处">
            <div v-html="docHtml"></div>
        </el-drawer>
    </div>
</template>

<script lang="ts" setup>
import { InfoFilled } from "@element-plus/icons-vue";
import { computed, ref } from "vue";
import { ChatMessage } from "./model";
import markdown from "./markdown";

const props = defineProps({
    docs: {
        type: Array<ChatMessage>,
        require: false,
        default: []
    }
})

const docHtml = computed(() => {
    const docText = props.docs.map(msg => msg.text).join();
    return markdown.render(docText);
})

const visible = ref(false);
</script>