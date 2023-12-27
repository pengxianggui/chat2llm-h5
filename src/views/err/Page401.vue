<template>
    <div class="page-401">
        <svg-icon value="unauthorize1" style="width: 100%; height: 80%;"></svg-icon>
        <el-text type="info">{{ message }}</el-text>
    </div>
</template>
<script setup lang="ts">
defineProps({
    message: {
        type: String,
        default: '未授权访问'
    }
})
</script>
<style scoped>
.page-401 {
    text-align: center;
    height: 100%;
}
</style>