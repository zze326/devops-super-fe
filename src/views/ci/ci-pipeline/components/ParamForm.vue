<template>
  <ElForm
    ref="formRef"
    :model="data"
    :rules="getRules(data)"
    label-width="80px"
  >
    <ElFormItem label="类型" prop="type">
      <el-select v-model="data.type" clearable placeholder="请选择参数类型">
        <el-option
          v-for="item in EParamTypeModel.getEnumList()"
          :key="item.value"
          :label="item.display"
          :value="item.value"
        />
      </el-select>
    </ElFormItem>
    <ElFormItem label="名称" prop="name">
      <el-input
        show-word-limit
        maxlength="40"
        v-model="data.name"
        clearable
        placeholder="请输入参数名称"
      />
    </ElFormItem>
    <ElFormItem label="显示文本" prop="display">
      <el-input
        show-word-limit
        maxlength="40"
        v-model="data.display"
        clearable
        placeholder="请输入参数名称"
      />
    </ElFormItem>

    <ElFormItem
      v-if="data.type === EParamType.ENUM_LIST"
      label="枚举列表"
      prop="enum"
    >
      <el-select
        class="w-[100%]"
        v-model="data.enumListData"
        multiple
        filterable
        allow-create
        :reserve-keyword="false"
        placeholder="请输入枚举项"
      />
    </ElFormItem>

    <div v-if="data.type === EParamType.GIT_BRANCH">
      <el-form-item label="Git 地址" prop="gitUrl">
        <el-input
          show-word-limit
          maxlength="300"
          v-model="data.gitUrl"
          clearable
          placeholder="请输入 Git 地址"
        />
      </el-form-item>
      <ElFormItem label="认证秘钥" prop="secretId">
        <el-select
          v-model="data.secretId"
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
    </div>
  </ElForm>
</template>

<script setup lang="ts">
import { EParamType, Param, EParamTypeModel } from "@/api/ci/ci-pipeline";
import { Model as SecretModel } from "@/api/resource/secret";
import { getGitBranchLstApi } from "@/api/common/common";
import { ref } from "vue";

import _ from "lodash";
import { FormInstance } from "element-plus";
const props = defineProps({
  data: {
    type: Object as PropType<Param>,
    required: true
  },
  gitBasicAuthSecrets: {
    type: Array as PropType<Partial<SecretModel>[]>,
    required: true
  }
});

const formRef = ref<FormInstance>();

async function validateForm() {
  return (
    await Promise.all(
      [formRef.value].map(formRefItem => {
        if (!formRefItem) return true;
        return formRefItem.validate().catch(_ => false);
      })
    )
  ).every(item => item === true);
}

defineExpose({
  validate: validateForm
});

const getRules = (data: Param) => {
  const globalRules = {
    type: [{ required: true, message: "参数类型为必选项", trigger: "blur" }],
    name: [{ required: true, message: "参数名称为必填项", trigger: "blur" }],
    display: [
      { required: true, message: "参数显示文本为必填项", trigger: "blur" }
    ]
  };

  const gitBranchRules = {
    gitUrl: [
      { required: true, message: "git url 为必填项", trigger: "blur" },
      {
        pattern: /^(git|https?|ssh):\/\/[^\s]+$/i,
        message: "请输入合法的 Git URL",
        trigger: "blur"
      }
    ],
    secretId: [
      {
        validator: async (_rule, _value, _callback) => {
          await getGitBranchLstApi(data.gitUrl, data.secretId);
          return true;
        },
        trigger: "change"
      }
    ]
  };

  if (!props.data) {
    return globalRules;
  }

  switch (props.data.type) {
    case EParamType.GIT_BRANCH:
      return _.merge(gitBranchRules, globalRules);
    default:
      return globalRules;
  }
};
</script>
