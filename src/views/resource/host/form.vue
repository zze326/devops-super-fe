<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { initValues, dynamicRules } from "./logic/form";
import { useCommonLogic } from "@/utils/common";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues(),
  hostGroupTreeList: null
});

const { switchStyle } = useCommonLogic();

const formRef = ref();
const formData = ref(props.formData);

const getRef = () => formRef.value;
defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="dynamicRules(formData)"
    label-width="80px"
  >
    <el-row :gutter="30">
      <re-col :xs="24" :sm="24">
        <el-form-item label="主机组" prop="hostGroupId">
          <el-cascader
            class="w-full"
            v-model="formData.hostGroupId"
            :options="hostGroupTreeList"
            :props="{
              value: 'id',
              label: 'name',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择所属主机组"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>
      <re-col :xs="24" :sm="24">
        <el-form-item label="名称" prop="name">
          <el-input
            show-word-limit
            maxlength="20"
            v-model="formData.name"
            clearable
            placeholder="请输入主机标识名称, 例: 测试机"
          />
        </el-form-item>
      </re-col>

      <re-col :value="15" :xs="24" :sm="24">
        <el-form-item label="主机地址" prop="hostAddr">
          <el-input
            show-word-limit
            maxlength="20"
            v-model="formData.hostAddr"
            clearable
            placeholder="请输入主机名或 IP, 例: 192.168.2.2"
          />
        </el-form-item>
      </re-col>

      <re-col :value="9" :xs="24" :sm="24">
        <ElFormItem label="端口" prop="port">
          <el-input-number
            v-model.number="formData.port"
            :min="20"
            :max="60000"
            placeholder="端口"
          />
        </ElFormItem>
      </re-col>
      <re-col :value="10" :xs="16" :sm="24">
        <ElFormItem label="用户名" prop="username">
          <el-input
            show-word-limit
            maxlength="20"
            v-model="formData.username"
            clearable
            placeholder="请输入连接用户名, 例: root"
        /></ElFormItem>
      </re-col>
      <re-col :value="6" :xs="24" :sm="24">
        <el-form-item label="记录会话" prop="name">
          <el-switch
            v-model="formData.saveSession"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            :style="switchStyle"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col :value="6" :xs="24" :sm="24">
        <el-form-item label="秘钥认证" prop="name">
          <el-switch
            v-model="formData.useKey"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            :style="switchStyle"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </re-col>
      <re-col :xs="16" :sm="24">
        <ElFormItem v-if="formData.useKey" label="秘钥" prop="privateKey">
          <el-input
            v-model="formData.privateKey"
            :rows="4"
            type="textarea"
            placeholder="请输入连接秘钥"
        /></ElFormItem>
        <ElFormItem v-else label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入连接密码"
            show-password
          />
        </ElFormItem>
      </re-col>
      <re-col :xs="16" :sm="24">
        <ElFormItem label="描述" prop="desc">
          <el-input
            show-word-limit
            v-model="formData.desc"
            :rows="2"
            type="textarea"
            maxlength="200"
            placeholder="请输入主机描述"
        /></ElFormItem>
      </re-col>
    </el-row>
  </el-form>
</template>
