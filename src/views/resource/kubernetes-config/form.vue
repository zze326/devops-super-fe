<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { rules, initValues } from "./logic/form";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues()
});

const formRef = ref();
const formData = ref(props.formData);

const getRef = () => formRef.value;
defineExpose({ getRef });
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="82px">
    <el-row :gutter="30">
      <re-col :xs="24" :sm="24">
        <el-form-item label="名称" prop="name">
          <el-input
            show-word-limit
            maxlength="30"
            v-model="formData.name"
            clearable
            placeholder="请输入配置名称"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <ElFormItem label="配置内容" prop="config">
          <el-input
            show-word-limit
            v-model="formData.config"
            :autosize="{ minRows: 4, maxRows: 14 }"
            type="textarea"
            maxlength="10000"
            placeholder="请输入配置内容"
        /></ElFormItem>
      </re-col>
    </el-row>
  </el-form>
</template>
