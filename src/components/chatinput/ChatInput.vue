<template>
  <div class="input-box">
    <el-input class="input" type="textarea" :placeholder="placeholder" ref="input" v-model="inputValue"
      :disabled="disabled" @focus="$emit('focus')" @input="handleInput" @keyup.shift.enter="send"
      :autosize="{ maxRows: 5 }">
    </el-input>
    <el-button class="send-btn" :class="{ 'disabled': disabled || !inputValue }" round type="info" @click="send"
      :disabled="disabled || !inputValue" v-if="!replying">
      <svg-icon value="send" size="1.5rem"></svg-icon>
    </el-button>
    <el-button class="send-btn" round type="danger" @click="$emit('abort')" v-else>停止响应</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRef, ref } from "vue";

const props = defineProps({
  modelValue: String,
  replying: {
    type: Boolean,
    require: false,
    default: false
  },
  disabled: {
    type: Boolean,
    require: false,
    default: false
  },
  autofocus: {
    type: Boolean,
    require: false,
    default: false
  },
  placeholder: String
})

const inputValue = toRef(props, 'modelValue');
const emit = defineEmits(["update:modelValue", 'send']);
const input = ref(null) // 变量名input必须和dom中ref值相同

onMounted(() => {
  if (props.autofocus) {
    input.value.focus()
  }
})

function handleInput(val?: String) {
  emit('update:modelValue', val)
}

function send() {
  emit('send')
}
</script>

<style scoped lang="scss">
.input-box {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  padding: 1rem 1rem;
  // background-color: #fff;
  // border-top: 1PX solid rgb(214, 214, 214);
  // box-shadow: 0 -1PX 6PX rgba(0, 0, 0, 0.1);

  .input {
    flex: 1;
    font-size: 1rem;
    border-radius: 1rem;
    border: 1PX solid #c7c7c7;
    padding: 0 1rem;
    background-color: white;

    // :focus-within 表示此元素或子元素被focus时, 样式生效
    // &:focus-within {
      // border: 1PX solid #585858;
    // }

    :deep(.el-textarea__inner) {
      box-shadow: none;
      background: transparent;
      resize: none;
      height: 2.5rem;
      line-height: 2.5rem;
      font-size: 1.2rem;
    }

    :deep(.el-textarea__inner::-webkit-scrollbar) {
      width: 0;
      height: 0;
    }

    :deep(.el-textarea__inner::placeholder) {
      color: #c4d5ea;
    }
  }

  .send-btn {
    color: #c4d5ea; 
    background-color: white;
    border: none;
    height: auto;
  }
  .send-btn.disabled {
    background-color: #ededed;
  }
}
</style>
