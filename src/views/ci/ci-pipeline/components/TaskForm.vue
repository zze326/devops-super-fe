<template>
  <ElForm ref="formRef" :model="data" :rules="rules" label-width="80px">
    <el-row>
      <el-col :span="10">
        <ElFormItem label="任务类型" prop="type">
          <el-select v-model="data.type" clearable placeholder="请选择任务类型">
            <el-option
              v-for="item in ETaskTypeModel.getEnumList()"
              :key="item.value"
              :label="item.display"
              :value="item.value"
            />
          </el-select>
        </ElFormItem>
      </el-col>
    </el-row>
  </ElForm>
  <ElForm
    v-if="data.type === ETaskType.GIT_PULL"
    ref="gitPullFormRef"
    :model="data.gitPullData"
    :rules="rules"
    label-width="80px"
  >
    <el-row :gutter="30">
      <el-col :span="24">
        <el-form-item label="Git 地址" prop="gitUrl">
          <el-input
            show-word-limit
            maxlength="300"
            v-model="(data.gitPullData as GitPullData).gitUrl"
            clearable
            placeholder="请输入 Git 地址"
          />
        </el-form-item>
      </el-col>
      <el-col :span="14">
        <el-form-item label="分支" prop="branch">
          <el-input
            show-word-limit
            maxlength="100"
            v-model="(data.gitPullData as GitPullData).branch"
            clearable
            placeholder="请输入 Git 分支"
          />
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <ElFormItem label="认证秘钥" prop="secretId">
          <el-select
            v-model="(data.gitPullData as GitPullData).secretId"
            clearable
            placeholder="请选择认证秘钥"
          >
            <el-option
              v-for="item in gitBasicAuthSecrets"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </ElFormItem>
      </el-col>
    </el-row>
  </ElForm>
  <ElForm
    ref="shellExecFormRef"
    v-if="data.type === ETaskType.SHELL_EXEC"
    :model="data.shellExecData"
    :rules="rules"
    label-width="80px"
  >
    <el-row :gutter="30">
      <el-col :span="18" :xs="18" :sm="18">
        <el-form-item label="工作目录" prop="workDir">
          <el-input
            show-word-limit
            maxlength="200"
            v-model="(data.shellExecData as ShellExecData).workDir"
            clearable
            placeholder="默认为当前目录，一般需要指定为代码目录"
          />
        </el-form-item>
      </el-col>
      <el-col :span="20" :xs="20" :sm="20">
        <el-form-item label="内容" prop="content">
          <el-input type="hidden" />
          <MonacoEditor
            height="200px"
            :show-minimap="false"
            :show-line-numbers="false"
            v-model="(data.shellExecData as ShellExecData).content"
            language="shell"
          />
        </el-form-item>
      </el-col> </el-row
  ></ElForm>
</template>

<script setup lang="ts">
import {
  ETaskType,
  Task,
  GitPullData,
  ShellExecData,
  ETaskTypeModel
} from "@/api/ci/ci-pipeline";
import { Model as SecretModel } from "@/api/resource/secret";
import { computed, ref } from "vue";
import MonacoEditor from "@/components/MonacoEditor/index.vue";

import _ from "lodash";
import { FormInstance } from "element-plus";
import { gitUrlRule, requiredRule } from "@/utils/formRules";
const props = defineProps({
  data: {
    type: Object as PropType<Task>,
    required: true
  },
  gitBasicAuthSecrets: {
    type: Array as PropType<Partial<SecretModel>[]>,
    required: true
  }
});

if (!props.data.gitPullData) props.data.gitPullData = {};
if (!props.data.shellExecData) props.data.shellExecData = {};

const formRef = ref<FormInstance>();
const gitPullFormRef = ref<FormInstance>();
const shellExecFormRef = ref<FormInstance>();

async function validateForm() {
  return (
    await Promise.all(
      [formRef.value, gitPullFormRef.value, shellExecFormRef.value].map(
        formRefItem => {
          if (!formRefItem) return true;
          return formRefItem.validate().catch(_ => false);
        }
      )
    )
  ).every(item => item === true);
}

defineExpose({
  validate: validateForm
});

const rules = computed(() => {
  const globalRules = {
    type: [requiredRule("任务类型为必选项")]
  };

  const gitPullRules = {
    gitUrl: [requiredRule("git url 为必填项"), gitUrlRule()],
    branch: [{ required: true, message: "git 分支为必填项", trigger: "blur" }]
  };

  const shellExecRules = {
    content: [requiredRule("shell 内容为必填项")]
  };

  if (!props.data) {
    return globalRules;
  }

  switch (props.data.type) {
    case ETaskType.GIT_PULL:
      return _.merge(gitPullRules, globalRules);
    case ETaskType.SHELL_EXEC:
      return _.merge(shellExecRules, globalRules);
    default:
      return globalRules;
  }
});
</script>
