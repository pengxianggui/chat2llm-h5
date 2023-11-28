<template>
  <div class="header">
    <el-button class="back" :icon="Back" circle size="large"
               @click="router.back()" v-if="route.meta.showBack"></el-button>
    <session-list v-else></session-list>

    <div class="title">{{ route.meta.title }}</div>

    <el-button class="setting" :icon="Setting" circle size="large"
               :style="{'visibility': route.meta.showSetting ? 'visible' : 'hidden'}"
               @click="openSetting"></el-button>
  </div>
</template>

<script setup lang="ts">
import {onBeforeRouteUpdate, useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {Back, Setting} from '@element-plus/icons-vue'
import SessionList from "@/views/sessions/SessionList.vue";

const route = useRoute()
const router = useRouter()

function openSetting() {
  // TODO 打开设置面板
}
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
