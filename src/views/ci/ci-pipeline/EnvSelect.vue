<template>
  <el-dialog
    v-model="store.envSelectVisible"
    title="添加环境"
    width="15%"
    :before-close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="{
        envId: [{ required: true, message: '必选项', trigger: 'blur' }]
      }"
      label-width="60px"
    >
      <ElFormItem label="环境" prop="envId">
        <el-select
          v-model="formData.envId"
          clearable
          placeholder="请选择环境"
          style="width: 100%"
        >
          <el-option
            v-for="item in state.allEnvs"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useStore } from "./logic/store";
import { reactive, onMounted, ref } from "vue";
import { getLstApi, Model } from "@/api/ci/ci-env";
import { FormInstance } from "element-plus";

const emits = defineEmits(["confirm", "cancel"]);

const store = useStore();
const formRef = ref<FormInstance>();
const formData = reactive({
  envId: null
});

const state = reactive<{ allEnvs: Partial<Model>[] }>({
  allEnvs: []
});

function handleConfirm() {
  formRef.value.validate(ok => {
    if (!ok) return;
    emits(
      "confirm",
      state.allEnvs.find(item => item.id === formData.envId)
    );
    handleClose();
  });
}

function handleClose() {
  emits("cancel");
  store.envSelectVisible = false;
}

async function init() {
  const res = await getLstApi();
  state.allEnvs = res.data.list;
}

onMounted(() => {
  init();
});
</script>
