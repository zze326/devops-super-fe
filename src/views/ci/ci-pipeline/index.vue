<script setup lang="ts">
import PipelineRun from "./pipeline-run.vue";
import Pipeline from "./pipeline.vue";
import ReCol from "@/components/ReCol";
defineOptions({
  name: "ci-pipeline-manage"
});
</script>
<template>
  <div class="main">
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <Pipeline />
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <PipelineRun />
      </re-col>
    </el-row>
  </div>
</template>
