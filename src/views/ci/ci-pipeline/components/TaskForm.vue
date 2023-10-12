<template>
  <ElForm ref="formRef" :model="data" :rules="rules" label-width="80px">
    <el-row>
      <el-col :span="16">
        <ElFormItem label="任务类型" prop="type">
          <el-select v-model="data.type" clearable placeholder="请选择任务类型">
            <el-option
              v-for="item in ETaskTypeModel.getEnumList()"
              :key="item.value"
              :label="item.display"
              :value="item.value"
            />
          </el-select>
        </ElFormItem> </el-col
    ></el-row>
    <el-row :gutter="30" v-if="data.type === ETaskType.GIT_PULL">
      <el-col :span="16">
        <el-form-item label="Git 地址" prop="gitUrl">
          <el-input
            show-word-limit
            maxlength="300"
            v-model="(data as GitPullData).gitUrl"
            clearable
            placeholder="请输入 Git 地址"
          />
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="分支" prop="branch">
          <el-input
            show-word-limit
            maxlength="100"
            v-model="(data as GitPullData).branch"
            clearable
            placeholder="请输入 Git Url"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="30" v-if="data.type === ETaskType.SHELL_EXEC">
      <el-col :span="20" :xs="20" :sm="20">
        <el-form-item label="内容" prop="content">
          <el-input
            show-word-limit
            maxlength="3000"
            :autosize="{ minRows: 4, maxRows: 8 }"
            type="textarea"
            v-model="(data as ShellExecData).content"
            clearable
            placeholder="请输入 Shell 脚本内容"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </ElForm>
</template>

<script setup lang="ts">
import {
  ETaskType,
  Task,
  GitPullData,
  ShellExecData,
  ETaskTypeModel
} from "@/api/ci/ci-pipeline";
import { computed, ref } from "vue";

import _ from "lodash";
import { FormInstance } from "element-plus";
const props = defineProps({
  data: {
    type: Object as PropType<Task>,
    required: true
  }
});

const formRef = ref<FormInstance>();

async function validateForm() {
  return await formRef.value.validate().catch(_ => false);
}

defineExpose({
  validate: validateForm
});

const rules = computed(() => {
  const globalRules = {
    type: [{ required: true, message: "任务类型为必选项", trigger: "blur" }]
  };

  const gitPullRules = {
    gitUrl: [
      { required: true, message: "git url 为必填项", trigger: "blur" },
      {
        pattern: /^(git|https?|ssh):\/\/[^\s]+$/i,
        message: "请输入合法的 Git URL",
        trigger: "blur"
      }
    ],
    branch: [{ required: true, message: "git 分支为必填项", trigger: "blur" }]
  };

  const shellExecRules = {
    content: [
      { required: true, message: "shell 内容为必填项", trigger: "blur" }
    ]
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
