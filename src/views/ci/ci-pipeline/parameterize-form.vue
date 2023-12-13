<template>
  <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
    <ElFormItem
      :key="idx"
      v-for="(baseItem, idx) in baseData"
      :label="baseItem.display"
      :prop="baseItem.name"
    >
      <el-input
        show-word-limit
        maxlength="40"
        v-model="formData[baseItem.name]"
        clearable
        v-if="baseItem.type === EParamType.STRING"
        :placeholder="`请输入${baseItem.display}`"
      />

      <el-switch
        v-if="baseItem.type === EParamType.BOOLEAN"
        inline-prompt
        active-text="是"
        inactive-text="否"
        v-model="formData[baseItem.name]"
      />

      <el-select
        v-if="baseItem.type === EParamType.ENUM_LIST"
        v-model="formData[baseItem.name]"
        clearable
        :placeholder="`请选择${baseItem.display}`"
      >
        <el-option
          v-for="item in baseItem.enumListData"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>

      <el-select
        v-if="baseItem.type === EParamType.GIT_BRANCH"
        v-model="formData[baseItem.name]"
        clearable
        :placeholder="`请选择${baseItem.display}`"
      >
        <el-option
          v-for="item in baseListMap[baseItem.name]"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
import { EParamType, Param } from "@/api/ci/ci-pipeline";
import { getGitBranchLstApi } from "@/api/common/common";
import { ref, onMounted, reactive } from "vue";

import _ from "lodash";
import { FormInstance } from "element-plus";
import { requiredRule } from "@/utils/formRules";
const props = defineProps({
  baseData: {
    type: Object as PropType<Param[]>,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
});

const rules = genRules(props.baseData);

function genRules(baseData: Param[]) {
  const rules = {};
  baseData.forEach(baseItem => {
    const rule = requiredRule(
      `${baseItem.display}为必${
        [EParamType.ENUM_LIST, EParamType.GIT_BRANCH].includes(baseItem.type)
          ? "选"
          : "填"
      }项`
    );
    rules[baseItem.name] = rule;
  });
  return rules;
}

const baseListMap = reactive({});

const formRef = ref<FormInstance>();

async function validateForm() {
  return formRef.value.validate().catch(_ => false);
}

defineExpose({
  validate: validateForm
});

function init() {
  props.baseData.forEach(async baseItem => {
    if (baseItem.type === EParamType.GIT_BRANCH) {
      const res = await getGitBranchLstApi(baseItem.gitUrl, baseItem.secretId);
      baseListMap[baseItem.name] = res.data.branches;
    }
  });
}

onMounted(init);
</script>
