<template>
    <div class="profile">
        <el-icon size="1.4rem" @click="visible = true">
            <svg-icon value="list"></svg-icon>
        </el-icon>
        <el-drawer v-model="visible" direction="rtl" size="86%" class="drawer" :append-to-body="false"
            :show-close="true">
            <template #header>
                <h3 class="title">个人设置</h3>
            </template>
            <SessionList></SessionList>
        </el-drawer>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from "vue";
import SessionList from "@/views/sessions/SessionList.vue";
const visible = ref(false);
</script>
  
<style scoped lang="scss">
.profile {
    display: flex;
    align-items: center;

    :deep(.el-drawer__header) {
        padding-bottom: 0.6rem;
    }
}
</style>
  