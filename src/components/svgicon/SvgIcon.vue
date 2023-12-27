<template>
  <svg :class="svgClass" aria-hidden="true" 
    :style="'width:' + size + ';height:' + size">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
  value: { // 图标名称与assets/icon/svg下使用的文件名一致
    type: String,
    required: true
  },
  className: { // 给图标添加class
    type: String,
    default: ''
  },
  color: { // 设置图标颜色
    type: String,
    default: '#333'
  },
  size: {
    type: String,
    default: '1em'
  }
});
const iconName = computed(() => {
  return `#icon-${props.value}`;
});
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return 'svg-icon';
});
</script>

<style scope lang="scss">
.svg-icon {
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>