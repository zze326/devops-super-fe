<script setup lang="ts">
import { reactive, ref, getCurrentInstance } from "vue";
import ReCol from "@/components/ReCol";
import { FormProps } from "./logic/types";
import { rules, initValues, persistenceFormRules } from "./logic/form";
import { PersistenceConfig } from "@/api/ci/ci-env";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Plus from "@iconify-icons/ep/plus";
import Minus from "@iconify-icons/ep/minus";
import { FormInstance } from "element-plus";
import { getConfig } from "@/config";

const props = withDefaults(defineProps<FormProps>(), {
  formData: () => initValues()
});

const state = reactive<{
  persistenceEnabled: boolean;
  persistenceConfigOld: PersistenceConfig;
  lastImage: string;
}>({
  persistenceEnabled: false,
  persistenceConfigOld: [],
  lastImage: ""
});

const appInstance = getCurrentInstance();
const formRef = ref();
const formData = ref(props.formData);

if (
  formData.value.persistenceConfig &&
  formData.value.persistenceConfig.length > 0
) {
  state.persistenceEnabled = true;
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
      : [{ pvcName: "", mountPath: "", subPath: "" }];
};

const handlePersistenceConfigItemAdd = () => {
  formData.value.persistenceConfig.push({
    pvcName: "",
    mountPath: "",
    subPath: ""
  });
};

const handlePersistenceConfigItemRemove = (idx: number) => {
  formData.value.persistenceConfig.splice(idx, 1);
};

const handleIsKanikoChange = (iskaniko: boolean) => {
  if (iskaniko) {
    state.lastImage = formData.value.image;
    formData.value.image = getConfig()?.CiEnvKanikoExecutorImage;
  } else {
    formData.value.image = state.lastImage;
  }
};

// 校验所有的表单
const validateAllForms = async () => {
  const validatePromiseArr = [formRef.value.validate().catch(_ => false)];

  if (appInstance?.refs["persistenceFormRef"]) {
    for (const formRef of appInstance?.refs[
      "persistenceFormRef"
    ] as Array<FormInstance>) {
      validatePromiseArr.push(formRef.validate().catch(_ => false));
    }
  }

  return (await Promise.all(validatePromiseArr)).every(item => item === true);
};

defineExpose({ validateAllForms });
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
              placeholder="请输入配置名称"
            />
          </el-form-item>
        </re-col>

        <re-col :xs="24" :sm="24">
          <ElFormItem label="镜像" prop="image">
            <el-input
              v-model="formData.image"
              type="text"
              :disabled="formData.isKaniko"
              show-word-limit
              maxlength="300"
            />
          </ElFormItem>
        </re-col>
        <re-col :xs="24" :sm="24">
          <el-space fill>
            <el-alert type="info" show-icon :closable="false">
              <p>
                Kubernetes 秘钥名称用于 Kubernetes 本身拉取指定镜像，将设置为
                Pod 的 imagePullSecret 字段值。
              </p>
            </el-alert>
            <ElFormItem label="Kubernetes 秘钥名称" prop="secretName">
              <el-input v-model="formData.secretName" type="text" />
            </ElFormItem>
          </el-space>
        </re-col>

        <el-col :span="12">
          <ElFormItem label="持久化">
            <el-switch
              inline-prompt
              active-text="开启"
              @change="handlePersistenceEnable"
              inactive-text="关闭"
              v-model="state.persistenceEnabled"
            />
          </ElFormItem>
          <el-alert type="info" show-icon :closable="false">
            <p>
              开启持久化则表示要挂载 PVC
              到指定目录以保存构建环境运行期间产生的数据。
            </p>
            <p v-if="formData.isKaniko">
              Kaniko 环境的镜像缓存目录为
              /cache，建议将持久化卷挂载到该目录使用缓存以提高构建速度。
            </p>
          </el-alert>
        </el-col>
        <el-col :span="12">
          <ElFormItem label="Kaniko 环境" prop="isKaniko">
            <el-switch
              inline-prompt
              active-text="是"
              inactive-text="否"
              @change="handleIsKanikoChange"
              v-model="formData.isKaniko"
            />
          </ElFormItem>
          <el-alert type="info" show-icon :closable="false">
            <p>
              Kaniko
              环境专门用来构建、推送镜像，默认使用本系统测试通过的镜像（镜像来源：gcriokaniko/executor）。
            </p>
          </el-alert>
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
              <el-input
                show-word-limit
                maxlength="30"
                v-model="formDataItem.pvcName"
                clearable
                placeholder="请输入 PVC 名称"
              />
            </el-form-item>
          </re-col>
          <re-col :xs="24" :sm="24">
            <el-form-item label="挂载路径" prop="mountPath">
              <el-input
                show-word-limit
                maxlength="200"
                v-model="formDataItem.mountPath"
                clearable
                placeholder="请输入挂载路径"
              />
            </el-form-item>
          </re-col>
          <re-col :xs="24" :sm="24">
            <el-form-item label="挂载子路径" prop="subPath">
              <el-input
                show-word-limit
                maxlength="200"
                v-model="formDataItem.subPath"
                clearable
                placeholder="请输入挂载子路径"
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
