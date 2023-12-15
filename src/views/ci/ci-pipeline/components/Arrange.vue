<template>
  <el-drawer
    v-model="store.arrangeVisible"
    title="编排流水线"
    :size="isParameterize ? '70%' : '50%'"
  >
    <el-row class="h-[100%]" :gutter="isParameterize ? 24 : 0">
      <el-col v-if="isParameterize" :span="7">
        <p class="text-center">
          <el-text tag="b" style="color: var(--el-color-primary)"
            >构建参数</el-text
          >
        </p>

        <div :key="paramIdx" v-for="(param, paramIdx) in state.params">
          <el-divider content-position="center">
            参数 {{ paramIdx + 1 }}
          </el-divider>
          <ParamForm
            ref="paramFormRef"
            :data="param"
            :git-basic-auth-secrets="state.gitBasicSecertList"
          />
          <p style="text-align: center">
            <el-button
              :icon="useRenderIcon(Plus)"
              circle
              type="success"
              @click="handleParamAdd(paramIdx)"
            />
            <el-button
              :icon="useRenderIcon(Minus)"
              circle
              type="danger"
              @click="handleParamRemove(paramIdx)"
            />
          </p>
        </div>
      </el-col>
      <el-col :span="isParameterize ? 17 : 24"
        ><el-tabs
          class="h-[94%]"
          type="card"
          v-model="state.currentEnvSort"
          stretch
          editable
          @tab-add="handleEnvTabsAdd"
          @tab-remove="handleEnvTabsRemove"
          @tab-change="handleEnvTabsChange"
        >
          <el-tab-pane
            v-for="envTab in state.envTabs"
            :name="envTab.sort"
            :key="envTab.sort"
            :label="`环境${envTab.sort}.${envTab.name}`"
          >
            <div v-if="envTab.isKaniko">
              <ElForm
                ref="kanikoFormRef"
                :model="envTab.kanikoParam"
                label-width="150px"
                :rules="kanikoFormRules"
              >
                <ElFormItem label="上下文目录" prop="contextDir">
                  <el-input
                    show-word-limit
                    maxlength="300"
                    v-model="envTab.kanikoParam.contextDir"
                    clearable
                    placeholder="上下文目录，相对路径，例： devops-super/docker-build"
                  />
                </ElFormItem>
                <ElFormItem label="Dockerfile 路径" prop="dockerfilePath">
                  <el-input
                    show-word-limit
                    maxlength="300"
                    v-model="envTab.kanikoParam.dockerfilePath"
                    clearable
                    placeholder="Dockerfile 路径，相对路径，例：devops-super/Dockerfile"
                  />
                </ElFormItem>
                <ElFormItem label="镜像推送地址" prop="imageDestination">
                  <el-input
                    show-word-limit
                    maxlength="300"
                    v-model="envTab.kanikoParam.imageDestination"
                    clearable
                    placeholder="镜像推送地址，例：registry.zze.xyz/online/devops-super:tmp"
                  />
                </ElFormItem>
                <ElFormItem label="镜像仓库认证秘钥" prop="secretId">
                  <el-select
                    v-model="envTab.kanikoParam.secretId"
                    clearable
                    placeholder="请选择镜像仓库认证秘钥"
                  >
                    <el-option
                      v-for="item in state.dockerRegistrySecretList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </ElFormItem>
                <el-space fill>
                  <el-alert type="info" show-icon :closable="false">
                    <p>
                      基础镜像指的是 Dockerfile 中 FROM
                      使用的镜像，如果启用，该流水线每次运行时都会重新拉取基础镜像，建议启用后运行一次流水线预热镜像后立即关闭，以提高构建镜像的速度。
                    </p>
                  </el-alert>
                  <ElFormItem
                    label="更新基础镜像缓存"
                    prop="updateBaseImageCache"
                  >
                    <el-switch
                      inline-prompt
                      active-text="启用"
                      inactive-text="禁用"
                      v-model="envTab.kanikoParam.updateBaseImageCache"
                    />
                  </ElFormItem>
                </el-space>
              </ElForm>
            </div>
            <el-tabs
              v-else
              v-model="envTab.currentStageSort"
              editable
              tab-position="left"
              @tab-add="handleStageTabsAdd"
              @tab-remove="handleStageTabsRemove"
            >
              <el-tab-pane
                v-for="stageTab in envTab.stages"
                :key="stageTab.sort"
                :name="stageTab.sort"
                :label="`阶段${stageTab.sort}.${stageTab.name}`"
              >
                <ElForm
                  ref="stageFormRef"
                  :model="stageTab"
                  :rules="{
                    name: [
                      {
                        required: true,
                        message: '阶段名称为必填项',
                        trigger: 'blur'
                      }
                    ]
                  }"
                  label-width="80px"
                >
                  <el-row>
                    <el-col :span="16">
                      <ElFormItem label="阶段名称" prop="name">
                        <el-input
                          show-word-limit
                          maxlength="20"
                          v-model="stageTab.name"
                          placeholder="请输入阶段名称"
                        />
                      </ElFormItem>
                    </el-col>
                  </el-row>
                </ElForm>
                <div :key="taskIdx" v-for="(task, taskIdx) in stageTab.tasks">
                  <el-divider content-position="center">
                    任务 {{ taskIdx + 1 }}
                  </el-divider>
                  <TaskForm
                    ref="taskFormRef"
                    :data="task"
                    :git-basic-auth-secrets="state.gitBasicSecertList"
                  />
                  <p style="text-align: center">
                    <el-button
                      :icon="useRenderIcon(Plus)"
                      circle
                      type="success"
                      @click="handleTaskAdd(stageTab, taskIdx)"
                    />
                    <el-button
                      :icon="useRenderIcon(Minus)"
                      circle
                      type="danger"
                      @click="handleTaskRemove(stageTab, taskIdx)"
                    />
                  </p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
        <div class="w-[100%] mt-5 text-center">
          <el-button
            :icon="useRenderIcon(ArrowUp)"
            :disabled="currentStage.sort <= 1 || currentStage.sort === 0"
            @click="handleUp"
            round
            >向上移动</el-button
          >
          <el-button
            :icon="useRenderIcon(ArrowLeft)"
            :disabled="state.currentEnvSort <= 1 || state.currentEnvSort === 0"
            @click="handleLeft"
            >向左移动</el-button
          >
          <el-button type="success" :disabled="!changed" @click="handleSave"
            >保存</el-button
          >
          <el-button
            :icon="useRenderIcon(ArrowRight)"
            :disabled="
              state.currentEnvSort >= state.envTabs.length ||
              state.currentEnvSort === 0
            "
            @click="handleRight"
            >向右移动</el-button
          >
          <el-button
            :icon="useRenderIcon(ArrowDown)"
            :disabled="
              currentStage.sort >=
                (currentEnvTab?.stages ? currentEnvTab?.stages.length : 0) ||
              currentStage.sort === 0
            "
            @click="handleDown"
            round
            >向下移动</el-button
          >
        </div>
        <EnvSelect
          v-if="store.envSelectVisible"
          @confirm="handleEnvSelectConfirm"
          @cancel="handleEnvSelectCancel"
      /></el-col>
    </el-row>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useStore } from "../logic/store";
import { reactive, onMounted, watch, computed, getCurrentInstance } from "vue";
import { Model as EnvModel } from "@/api/ci/ci-env";
import {
  uptConfigApi,
  getConfigApi,
  Task,
  Param,
  KanikoParam
} from "@/api/ci/ci-pipeline";
import {
  ESecretType,
  getLstApi as getSecretLstApi,
  Model as SecretModel
} from "@/api/resource/secret";
import {
  relativePathFileRule,
  relativePathRule,
  requiredRule
} from "@/utils/formRules";
import EnvSelect from "./EnvSelect.vue";
import TaskForm from "./TaskForm.vue";
import ParamForm from "./ParamForm.vue";
import { cloneDeep } from "@pureadmin/utils";
import { TabPaneName } from "element-plus/es/components/tabs/src/tabs";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import _ from "lodash";
import ArrowUp from "@iconify-icons/ep/arrow-up";
import ArrowDown from "@iconify-icons/ep/arrow-down";
import ArrowLeft from "@iconify-icons/ep/arrow-left";
import ArrowRight from "@iconify-icons/ep/arrow-right";
import Plus from "@iconify-icons/ep/plus";
import Minus from "@iconify-icons/ep/minus";
import { FormInstance } from "element-plus";

type StageTab = { name: string; sort: number; tasks: Task[] };
type EnvTab = Partial<{
  id: number;
  name: string;
  sort: number;
  kanikoParam?: KanikoParam;
  isKaniko: boolean;
  stages: StageTab[];
  currentStageSort: number;
}>;

const store = useStore();

const isParameterize = store.arrangeCurrent.parameterize;

const state = reactive<{
  envTabs: EnvTab[];
  currentEnvSort: number;
  changePoint: string;
  params: Param[];
  gitBasicSecertList: Partial<SecretModel>[];
  dockerRegistrySecretList: Partial<SecretModel>[];
}>({
  envTabs: [],
  currentEnvSort: 0,
  changePoint: "",
  params: cloneDeep(store.arrangeCurrent.params) || [],
  gitBasicSecertList: [],
  dockerRegistrySecretList: []
});

const appInstance = getCurrentInstance();

const kanikoFormRules = {
  contextDir: [
    requiredRule("上下文目录为必填项"),
    relativePathRule("上下文目录路径必须是相对路径")
  ],
  dockerfilePath: [
    requiredRule("Dockerfile 路径为必填项"),
    relativePathFileRule("Dockerfile 路径必须是相对路径")
  ],
  imageDestination: [requiredRule("镜像推送地址为必填项")],
  updateBaseImageCache: [requiredRule("是否更新缓存为必填项")],
  secretId: [requiredRule("镜像仓库认证秘钥为必填项")]
};

// 添加环境 - 打开环境选择框
function handleEnvTabsAdd() {
  store.envSelectVisible = true;
}

// 移除环境
function handleEnvTabsRemove(val: TabPaneName) {
  if (state.envTabs.length === 1) {
    message("最起码保留一个环境", { type: "warning" });
    return;
  }

  const removeCurrent = state.currentEnvSort === val;
  const idx = state.envTabs.findIndex(item => item.sort === val);
  state.envTabs.splice(idx, 1);

  if (removeCurrent) {
    if (state.currentEnvSort > 1) {
      state.currentEnvSort = state.currentEnvSort - 1;
    }
  } else {
    if ((val as number) < state.currentEnvSort) {
      state.currentEnvSort = state.currentEnvSort - 1;
    }
  }
}

function newEmptyTask() {
  return {
    type: null,
    gitPullData: {},
    shellExecData: {}
  };
}

// 确认新增环境
function handleEnvSelectConfirm(envData: EnvModel) {
  const newEnvTab = cloneDeep(envData) as EnvTab;
  newEnvTab.sort = state.envTabs.length + 1;
  if (envData.isKaniko) {
    newEnvTab.kanikoParam = newEmptyKanikoParam();
    newEnvTab.stages = [];
  } else {
    newEnvTab.stages = [{ name: "未命名", sort: 1, tasks: [newEmptyTask()] }];
  }
  newEnvTab.currentStageSort = 1;
  state.envTabs.push(newEnvTab);
  state.currentEnvSort = newEnvTab.sort;
}

// 切换环境
function handleEnvTabsChange(_: TabPaneName) {
  if (!currentEnvTab.value.currentStageSort) {
    (currentEnvTab.value.stages || []).forEach((item, index) => {
      item.sort = index + 1;
    });
    currentEnvTab.value.currentStageSort = currentEnvTab.value.stages.length;
  }
}

// 取消新增环境
function handleEnvSelectCancel() {
  if (state.envTabs.length === 0) {
    store.arrangeVisible = false;
  }
}

// 新增阶段
function handleStageTabsAdd() {
  const newStage = {
    name: "未命名",
    sort: currentEnvTab.value.stages.length + 1,
    tasks: [newEmptyTask()]
  };
  currentEnvTab.value.stages.push(newStage);
  currentEnvTab.value.currentStageSort = newStage.sort;
}

// 移除阶段
function handleStageTabsRemove(val: TabPaneName) {
  if (currentEnvTab.value.stages.length === 1) {
    message("最起码保留一个阶段", { type: "warning" });
    return;
  }

  const removeCurrent = currentEnvTab.value.currentStageSort === val;
  const idx = currentEnvTab.value.stages.findIndex(item => item.sort === val);
  currentEnvTab.value.stages.splice(idx, 1);

  if (removeCurrent) {
    if (currentEnvTab.value.currentStageSort > 1) {
      currentEnvTab.value.currentStageSort =
        currentEnvTab.value.currentStageSort - 1;
    }
  } else {
    if ((val as number) < currentEnvTab.value.currentStageSort) {
      currentEnvTab.value.currentStageSort =
        currentEnvTab.value.currentStageSort - 1;
    }
  }
}

// 当期选择的环境 tab
const currentEnvTab = computed(() => {
  return state.envTabs[state.currentEnvSort - 1];
});

// 当前选择的阶段 tab
const currentStage = computed(() => {
  return (
    currentEnvTab.value?.stages.find(
      item => item.sort === currentEnvTab.value?.currentStageSort
    ) ?? { sort: 0 }
  );
});

// 环境 tab 向左移动
const handleLeft = () => {
  // 与前一个元素交换位置
  const preEnvSort = state.currentEnvSort - 1;
  const prevEnvTab = state.envTabs.find(item => item.sort === preEnvSort);
  if (prevEnvTab) {
    const temp = currentEnvTab.value?.sort;
    currentEnvTab.value!.sort = prevEnvTab.sort;
    prevEnvTab.sort = temp!;
  }
  state.envTabs = state.envTabs.sort((a, b) => a.sort - b.sort);
  state.currentEnvSort = preEnvSort;
};

// 环境 tab 向右移动
const handleRight = () => {
  // 与后一个元素交换位置
  const nextEnvSort = state.currentEnvSort + 1;
  const nextEnvRef = state.envTabs.find(
    item => item.sort === state.currentEnvSort + 1
  );
  if (nextEnvRef) {
    const temp = currentEnvTab.value?.sort;
    currentEnvTab.value!.sort = nextEnvRef.sort;
    nextEnvRef.sort = temp!;
  }
  state.envTabs = state.envTabs.sort((a, b) => a.sort - b.sort);
  state.currentEnvSort = nextEnvSort;
};

// 阶段 tab 向上移动
const handleUp = () => {
  const preStageSort = currentEnvTab.value.currentStageSort - 1;
  const prevStage = currentEnvTab.value?.stages.find(
    item => item.sort === preStageSort
  );
  if (prevStage) {
    const temp = currentStage.value?.sort;
    currentStage.value!.sort = prevStage.sort;
    prevStage.sort = temp!;
  }
  currentEnvTab.value!.stages = currentEnvTab.value!.stages.sort(
    (a, b) => a.sort - b.sort
  );
  currentEnvTab.value.currentStageSort = preStageSort;
};

// 阶段 tab 向下移动
const handleDown = () => {
  const nextStageSort = currentEnvTab.value.currentStageSort + 1;
  const nextStage = currentEnvTab.value?.stages.find(
    item => item.sort === currentEnvTab.value.currentStageSort + 1
  );
  if (nextStage) {
    const temp = currentStage.value?.sort;
    currentStage.value!.sort = nextStage.sort;
    nextStage.sort = temp!;
  }
  currentEnvTab.value!.stages = currentEnvTab.value!.stages.sort(
    (a, b) => a.sort - b.sort
  );
  currentEnvTab.value.currentStageSort = nextStageSort;
};

// 添加任务
const handleTaskAdd = (stage: StageTab, idx: number) => {
  stage.tasks.splice(idx + 1, 0, newEmptyTask());
  // stage.tasks.push(newEmptyTask());
};

// 移除任务
const handleTaskRemove = (stage: StageTab, idx: number) => {
  if (stage.tasks.length === 1) {
    message("最起码保留一个任务", { type: "warning" });
    return;
  }
  stage.tasks.splice(idx, 1);
};

// 校验所有的表单
const validateAllForms = async () => {
  const validatePromiseArr = [];
  if (appInstance?.refs["stageFormRef"]) {
    for (const formRef of appInstance?.refs[
      "stageFormRef"
    ] as Array<FormInstance>) {
      validatePromiseArr.push(formRef.validate().catch(_ => false));
    }
  }

  if (appInstance?.refs["taskFormRef"]) {
    for (const formRef of appInstance?.refs[
      "taskFormRef"
    ] as Array<FormInstance>) {
      validatePromiseArr.push(formRef.validate().catch(_ => false));
    }
  }

  if (appInstance?.refs["paramFormRef"]) {
    for (const formRef of appInstance?.refs[
      "paramFormRef"
    ] as Array<FormInstance>) {
      validatePromiseArr.push(formRef.validate().catch(_ => false));
    }
  }

  if (appInstance?.refs["kanikoFormRef"]) {
    for (const formRef of appInstance?.refs[
      "kanikoFormRef"
    ] as Array<FormInstance>) {
      validatePromiseArr.push(formRef.validate().catch(_ => false));
    }
  }

  return (await Promise.all(validatePromiseArr)).every(item => item === true);
};

// 保存
const handleSave = async () => {
  if (!(await validateAllForms())) {
    message("表单校验不通过", { type: "warning" });
    return;
  }
  const reqData = getRequestData();
  await uptConfigApi(store.id, reqData);
  setChangePoint();
  store.arrangeCurrent.params = state.params;
  message("保存成功", { type: "success" });
};

// 将当前页面数据整理成请求格式数据
function getRequestData() {
  return {
    config: state.envTabs.map(envTab => {
      return {
        id: envTab.id,
        stages: envTab.isKaniko
          ? []
          : envTab.stages.map(stageTab => _.pick(stageTab, ["name", "tasks"])),
        kanikoParam: envTab.kanikoParam // kaniko 构建参数
      };
    }),
    params: state.params
  };
}

// 当环境 tabs 长度变化时重新计算 sort
watch(
  () => state.envTabs.length,
  () => {
    (state.envTabs || []).forEach((item, index) => {
      item.sort = index + 1;
      item.stages = item.stages ?? [];
    });
  }
);

// 当阶段 tabs 长度变化时重新计算 sort
watch(
  () => currentEnvTab.value?.stages.length,
  () => {
    (currentEnvTab.value.stages || []).forEach((item, index) => {
      item.sort = index + 1;
    });
  }
);

// 设置当前页面数据标识
function setChangePoint() {
  state.changePoint = JSON.stringify(getRequestData());
}
// 是否有更改
const changed = computed(() => {
  return JSON.stringify(getRequestData()) !== state.changePoint;
});

// 创建空参数
function newEmptyParam(): Param {
  return {
    type: null,
    name: "",
    display: ""
  };
}

// 创建空的 kaniko 参数
function newEmptyKanikoParam(): KanikoParam {
  return {
    contextDir: "",
    dockerfilePath: "",
    imageDestination: "",
    updateBaseImageCache: false,
    secretId: null
  };
}

// 新增参数
const handleParamAdd = (idx: number) => {
  state.params.splice(idx + 1, 0, newEmptyParam());
};

// 移除参数
const handleParamRemove = (idx: number) => {
  if (state.params.length === 1) {
    message("最起码保留一个参数", { type: "warning" });
    return;
  }
  state.params.splice(idx, 1);
};

// 初始化页面数据
async function init() {
  const [res1, res2, res3] = await Promise.all([
    getSecretLstApi({ type: ESecretType.GIT_BASIC_AUTH }),
    getSecretLstApi({ type: ESecretType.DOCKER_REGISTRY_AUTH }),
    getConfigApi(store.id)
  ]);

  state.gitBasicSecertList = res1.data.list;
  state.dockerRegistrySecretList = res2.data.list;
  if (res3.data.config && res3.data.config.length > 0) {
    res3.data.config.forEach(envItem => {
      const envInfo = res3.data.envMap[envItem.id];
      envItem.name = envInfo.name;
      envItem.isKaniko = envInfo.isKaniko;
      envItem.stages?.forEach(stageItem => {
        if (!stageItem.tasks) {
          stageItem.tasks = [newEmptyTask()];
        }
      });
      if (envItem.isKaniko && !envItem.kanikoParam) {
        envItem.kanikoParam = newEmptyKanikoParam();
      }
    });
    state.envTabs = res3.data.config as EnvTab[];
    state.currentEnvSort = state.envTabs.length;
    currentEnvTab.value.currentStageSort = currentEnvTab.value.stages.length;
  }
  state.params = state.params || [newEmptyParam()];
  // 记录初始数据，用于对比是否有更改
  setChangePoint();
  state.envTabs.length === 0 && handleEnvTabsAdd();
}

onMounted(init);
</script>
