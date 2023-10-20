<script setup lang="ts">
import { ref, reactive, getCurrentInstance } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { rules, initValues, persistenceFormRules } from "./logic/form";
import {
  getNamespaceLstApi as getKubernetesNamespaceLstApi,
  getPvcLstApi as getKubernetesPvcLstAPi
} from "@/api/common/kubernetes";
import { Model as KubernetesConfig } from "@/api/resource/secret";
import { PersistenceConfig } from "@/api/ci/ci-pipeline";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Plus from "@iconify-icons/ep/plus";
import Minus from "@iconify-icons/ep/minus";
import { FormInstance } from "element-plus";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues(),
  kubernetesConfigs: () => [] as KubernetesConfig[]
});

const appInstance = getCurrentInstance();
const formRef = ref();
const formData = ref(props.formData);
const state = reactive<{
  namespaces: string[];
  persistenceEnabled: boolean;
  persistenceConfigOld: PersistenceConfig;
  pvcs: string[];
}>({
  namespaces: [],
  persistenceEnabled: false,
  persistenceConfigOld: [],
  pvcs: []
});

async function loadNamespaces() {
  // 加载命名空间
  if (formData.value.kubernetesConfigId) {
    const res = await getKubernetesNamespaceLstApi(
      formData.value.kubernetesConfigId
    );
    state.namespaces = res.data.namespaces;
  }
}

async function loadPvcs() {
  if (!formData.value.kubernetesNamespace) return;
  const res = await getKubernetesPvcLstAPi(
    formData.value.kubernetesConfigId,
    formData.value.kubernetesNamespace
  );
  state.pvcs = res.data.pvcs;
}

if (formData.value.persistenceConfig) {
  state.persistenceEnabled = true;
}
function init() {
  loadNamespaces();
  loadPvcs();
}

const handlePersistenceEnable = (enabled: boolean) => {
  if (!enabled) {
    state.persistenceConfigOld = formData.value.persistenceConfig;
    formData.value.persistenceConfig = [];
    return;
  }
  if (
    formData.value.persistenceConfig &&
    formData.value.persistenceConfig.length > 0
  )
    return;

  formData.value.persistenceConfig =
    state.persistenceConfigOld && state.persistenceConfigOld.length > 0
      ? state.persistenceConfigOld
      : [{ pvcName: "", mountPath: "" }];
};

const handlePersistenceConfigItemAdd = () => {
  formData.value.persistenceConfig.push({
    pvcName: "",
    mountPath: ""
  });
};

const handlePersistenceConfigItemRemove = (idx: number) => {
  formData.value.persistenceConfig.splice(idx, 1);
};

// 校验所有的表单
const validateAllForms = async () => {
  const validatePromiseArr = [formRef.value.validate().catch(_ => false)];

  for (const formRef of appInstance?.refs[
    "persistenceFormRef"
  ] as Array<FormInstance>) {
    validatePromiseArr.push(formRef.validate().catch(_ => false));
  }

  return (await Promise.all(validatePromiseArr)).every(item => item === true);
};

defineExpose({ validateAllForms });

init();
</script>

<template>
  <div>
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
              @change="loadNamespaces"
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
              @change="loadPvcs"
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
        <el-col :xs="24" :sm="24">
          <ElFormItem label="持久化">
            <el-switch
              inline-prompt
              active-text="开启"
              @change="handlePersistenceEnable"
              inactive-text="关闭"
              v-model="state.persistenceEnabled"
            />
          </ElFormItem>
        </el-col>
      </el-row>
    </el-form>

    <div :key="idx" v-for="(formDataItem, idx) in formData.persistenceConfig">
      <el-divider content-position="center"> 挂载项 {{ idx + 1 }} </el-divider>
      <el-form
        ref="persistenceFormRef"
        :model="formDataItem"
        :rules="persistenceFormRules"
        label-width="150px"
      >
        <el-row :gutter="30">
          <re-col :xs="24" :sm="24">
            <el-form-item label="PVC 名称" prop="pvcName">
              <el-select
                v-model="formDataItem.pvcName"
                class="w-full"
                :filterable="true"
                placeholder="请选择 PVC"
              >
                <el-option
                  v-for="item in state.pvcs"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </re-col>
          <re-col :xs="24" :sm="24">
            <el-form-item label="挂载路径" prop="mountPath">
              <el-input
                show-word-limit
                maxlength="200"
                v-model="formDataItem.mountPath"
                clearable
                placeholder="请输入流水线名称"
              />
            </el-form-item>
          </re-col>
        </el-row>
      </el-form>
      <p class="text-center">
        <el-button
          :icon="useRenderIcon(Plus)"
          circle
          type="success"
          @click="handlePersistenceConfigItemAdd()"
        />
        <el-button
          :icon="useRenderIcon(Minus)"
          circle
          type="danger"
          @click="handlePersistenceConfigItemRemove(idx)"
        />
      </p>
    </div>
  </div>
</template>
