<template>
    <el-descriptions title="个人信息">
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="状态">
            <el-tag :type="user.enable ? 'primary' : 'danger'">{{ user.enable ? '正常' : '禁用' }}</el-tag>
        </el-descriptions-item>
    </el-descriptions>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const user = userStore.user;
</script>