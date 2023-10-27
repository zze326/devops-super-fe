<template>
  <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <ElFormItem label="流水线名称" prop="name">
      <el-input
        show-word-limit
        maxlength="30"
        v-model="formData.name"
        clearable
        placeholder="请输入新流水线名称"
      />
    </ElFormItem>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance } from "element-plus";
import { ref } from "vue";

defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const rules = {
  name: [
    {
      required: true,
      message: "流水线名称为必填项",
      trigger: "blur"
    }
  ]
};

const formRef = ref<FormInstance>();

async function validateForm() {
  return formRef.value.validate().catch(_ => false);
}

defineExpose({
  validate: validateForm
});
</script>
