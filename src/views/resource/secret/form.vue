<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { rules, initValues, dynamicContentRules } from "./logic/form";
import {
  ESecretTypeModel,
  ESecretType,
  TextContent,
  UsernamePasswordContent,
  DockerRegistryAuthContent
} from "@/api/resource/secret";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues(),
  isEdit: Boolean
});

const formRef = ref();
const contentFormRef = ref();
const formData = ref(props.formData);

const handleTypeChange = (val: ESecretType) => {
  if (val === ESecretType.DOCKER_REGISTRY_AUTH) {
    const dockerRegistryAuthContent = formData.value
      .content as DockerRegistryAuthContent;
    if (!dockerRegistryAuthContent.registryUrl)
      dockerRegistryAuthContent.registryUrl = "https://index.docker.io/v1/";
  }
};

const getRefs = () => [formRef.value, contentFormRef.value];
defineExpose({ getRefs });
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="82px">
    <el-row :gutter="30">
      <re-col :xs="24" :sm="24">
        <el-form-item label="秘钥名称" prop="name">
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
        <el-form-item label="秘钥类型" prop="type">
          <el-radio-group @change="handleTypeChange" v-model="formData.type">
            <el-radio-button
              :disabled="isEdit"
              v-for="item in ESecretTypeModel.getEnumList()"
              :key="item.value"
              :label="item.value"
              >{{ item.display }}</el-radio-button
            >
          </el-radio-group>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
  <el-form
    ref="contentFormRef"
    :model="formData.content"
    :rules="dynamicContentRules(formData)"
    label-width="82px"
  >
    <el-row :gutter="30" v-if="formData.type === ESecretType.KUBERNETES_CONFIG">
      <re-col :xs="24" :sm="24">
        <ElFormItem label="配置内容" prop="text">
          <el-input
            show-word-limit
            v-model="(formData.content as TextContent).text"
            :autosize="{ minRows: 4, maxRows: 14 }"
            type="textarea"
            maxlength="10000"
            placeholder="请输入配置内容"
        /></ElFormItem>
      </re-col>
    </el-row>
    <el-row :gutter="30" v-if="formData.type === ESecretType.GIT_BASIC_AUTH">
      <re-col :xs="24" :sm="24">
        <el-form-item label="用户名" prop="username">
          <el-input
            show-word-limit
            maxlength="30"
            v-model="(formData.content as UsernamePasswordContent).username"
            clearable
            placeholder="请输入用户名"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-form-item label="密码" prop="password">
          <el-input
            show-word-limit
            maxlength="64"
            type="password"
            v-model="(formData.content as UsernamePasswordContent).password"
            clearable
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row
      :gutter="30"
      v-if="formData.type === ESecretType.DOCKER_REGISTRY_AUTH"
    >
      <re-col :xs="24" :sm="24">
        <el-form-item label="仓库地址" prop="registryUrl">
          <el-input
            show-word-limit
            maxlength="200"
            v-model="(formData.content as DockerRegistryAuthContent).registryUrl"
            clearable
            placeholder="请输入仓库地址"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-form-item label="用户名" prop="username">
          <el-input
            show-word-limit
            maxlength="30"
            v-model="(formData.content as DockerRegistryAuthContent).username"
            clearable
            placeholder="请输入用户名"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-form-item label="密码" prop="password">
          <el-input
            show-word-limit
            maxlength="64"
            type="password"
            v-model="(formData.content as DockerRegistryAuthContent).password"
            clearable
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
