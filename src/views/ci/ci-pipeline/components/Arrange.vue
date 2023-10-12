<template>
  <el-drawer v-model="store.arrangeVisible" title="编排流水线" size="50%">
    <el-tabs
      class="h-[95%] overflow-scroll"
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
        <el-tabs
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
              <TaskForm ref="taskFormRef" :data="task" />
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
    <div class="w-[100%] mt-2 text-center">
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
    />
  </el-drawer>
</template>

<script lang="ts" setup>
import { useStore } from "../logic/store";
import { reactive, onMounted, watch, computed, getCurrentInstance } from "vue";
import { Model as EnvModel } from "@/api/ci/ci-env";
import { uptConfigApi, getConfigApi, Task } from "@/api/ci/ci-pipeline";
import EnvSelect from "./EnvSelect.vue";
import TaskForm from "./TaskForm.vue";
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
  stages: StageTab[];
  currentStageSort: number;
}>;
const store = useStore();
const state = reactive<{
  envTabs: EnvTab[];
  currentEnvSort: number;
  changePoint: string;
}>({
  envTabs: [],
  currentEnvSort: 0,
  changePoint: ""
});

const appInstance = getCurrentInstance();

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
    data: null
  };
}

// 确认新增环境
function handleEnvSelectConfirm(envData: EnvModel) {
  const newEnvTab = cloneDeep(envData) as EnvTab;
  newEnvTab.sort = state.envTabs.length + 1;
  newEnvTab.stages = [{ name: "未命名", sort: 1, tasks: [newEmptyTask()] }];
  newEnvTab.currentStageSort = 1;
  state.envTabs.push(newEnvTab);
  state.currentEnvSort = newEnvTab.sort;
}

// 切换环境
function handleEnvTabsChange(_: TabPaneName) {
  if (!currentEnvTab.value.currentStageSort) {
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
  for (const formRef of appInstance?.refs[
    "stageFormRef"
  ] as Array<FormInstance>) {
    validatePromiseArr.push(formRef.validate().catch(_ => false));
  }

  for (const formRef of appInstance?.refs[
    "taskFormRef"
  ] as Array<FormInstance>) {
    validatePromiseArr.push(formRef.validate().catch(_ => false));
  }

  return (await Promise.all(validatePromiseArr)).every(item => item === true);
};

// 保存
const handleSave = async () => {
  console.log(state.envTabs);
  if (!(await validateAllForms())) {
    message("表单校验不通过", { type: "warning" });
    return;
  }
  const reqData = getRequestData();
  await uptConfigApi(store.id, { config: reqData });
  setChangePoint();
  message(`保存成功`, { type: "success" });
};

// 将当前页面数据整理成请求格式数据
function getRequestData() {
  return state.envTabs.map(envTab => {
    return {
      id: envTab.id,
      stages: envTab.stages.map(stageTab => _.pick(stageTab, ["name", "tasks"]))
    };
  });
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

// 初始化页面数据
async function init() {
  const res = await getConfigApi(store.id);
  if (res.data.config) {
    res.data.config.forEach(envItem => {
      envItem.name = res.data.envMap[envItem.id];
      envItem.stages.forEach(stageItem => {
        if (!stageItem.tasks) {
          stageItem.tasks = [newEmptyTask()];
        }
      });
    });
    state.envTabs = res.data.config as EnvTab[];
    state.currentEnvSort = state.envTabs.length;
    currentEnvTab.value.currentStageSort = currentEnvTab.value.stages.length;
  }
  // 记录初始数据，用于对比是否有更改
  setChangePoint();
  state.envTabs.length === 0 && handleEnvTabsAdd();
}

onMounted(init);
</script>
