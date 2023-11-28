<template>
  <div class="input-box">
    <el-input class="input" type="textarea" :placeholder="placeholder"
              ref="input"
              v-model="inputValue" :disabled="disabled"
              @focus="$emit('focus')"
              @input="handleInput"
              @keyup.shift.enter="send"
              :autosize="{ maxRows: 5 }">
    </el-input>
    <el-button round type="info" @click="send" :disabled="disabled">发送</el-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, toRef, ref} from "vue";

const props = defineProps({
  modelValue: String,
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
  align-items: center;
  padding: 0.3rem 1rem;
  background-color: #fff;

  .input {
    flex: 1;
    font-size: 1rem;
    border-radius: 2rem;
    border: 1PX solid #c7c7c7;
    padding: 0 1rem;

    // :focus-within 表示此元素或子元素被focus时, 样式生效
    &:focus-within {
      border: 1PX solid #585858;
    }

    :deep(.el-textarea__inner) {
      box-shadow: none;
      background: transparent;
      resize: none;
    }

    :deep(.el-textarea__inner::-webkit-scrollbar) {
      width: 0;
      height: 0;
    }

    :deep(.el-textarea__inner::placeholder) {
      color: #d1d1d1;
    }
  }
}
</style>
