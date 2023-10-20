<script setup lang="ts">
import { ref, reactive } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { rules, initValues } from "./logic/form";
import { Model as KubernetesConfig } from "@/api/resource/secret";
import { getNamespaceLstApi as getKubernetesNamespaceListApi } from "@/api/common/kubernetes";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues(),
  kubernetesConfigs: () => [] as KubernetesConfig[]
});

const formRef = ref();
const formData = ref(props.formData);
const state = reactive<{ namespaces: string[] }>({
  namespaces: []
});

const getRef = () => formRef.value;
defineExpose({ getRef });

async function init() {
  // 加载命名空间
  if (formData.value.kubernetesConfigId) {
    const res = await getKubernetesNamespaceListApi(
      formData.value.kubernetesConfigId
    );
    state.namespaces = res.data.namespaces;
  }
}
init();
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
            placeholder="请输入流水线名称"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <ElFormItem label="Kubernetes Config" prop="kubernetesConfigId">
          <el-select
            v-model="formData.kubernetesConfigId"
            class="w-full"
            placeholder="请选择 Kubernetes Config"
          >
            <el-option
              v-for="item in props.kubernetesConfigs"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </ElFormItem>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-form-item label="名称空间" prop="kubernetesNamespace">
          <el-select
            v-model="formData.kubernetesNamespace"
            class="w-full"
            :filterable="true"
            placeholder="请选择名称空间"
          >
            <el-option
              v-for="item in state.namespaces"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <ElFormItem label="描述" prop="desc">
          <el-input
            show-word-limit
            v-model="formData.desc"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            maxlength="200"
            placeholder="请输入流水线描述"
          />
        </ElFormItem>
      </re-col>
    </el-row>
  </el-form>
</template>
