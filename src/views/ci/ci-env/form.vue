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
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px">
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
        <ElFormItem label="镜像" prop="image">
          <el-input
            v-model="formData.image"
            type="text"
            show-word-limit
            maxlength="300"
          />
        </ElFormItem>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-space fill>
          <el-alert type="info" show-icon :closable="false">
            <p>
              Kubernetes 秘钥名称用于 Kubernetes 本身拉取指定镜像，将设置为 Pod
              的 imagePullSecret 字段值。
            </p>
          </el-alert>
          <ElFormItem label="Kubernetes 秘钥名称" prop="secretName">
            <el-input v-model="formData.secretName" type="text" />
          </ElFormItem>
        </el-space>
      </re-col>
    </el-row>
  </el-form>
</template>
