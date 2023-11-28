<template>
  <div class="header">
    <el-button class="back" :icon="Back" circle size="large"
               @click="router.back()" v-if="route.meta.showBack"></el-button>
    <SessionList v-else></SessionList>

    <div class="title">{{ route.meta.title }}</div>

    <!-- <el-button class="setting" :icon="Setting" circle size="large"
               :style="{'visibility': route.meta.showSetting ? 'visible' : 'hidden'}"
               @click="openSetting"></el-button> -->
    <ChatParam v-if="route.meta.showSetting"></ChatParam>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {Back} from '@element-plus/icons-vue'
import SessionList from "@/views/sessions/SessionList.vue";

const route = useRoute()
const router = useRouter()
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
