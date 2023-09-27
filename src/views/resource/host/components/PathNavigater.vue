<template>
  <div class="file-path">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item style="height: 14px" @click="handleClick('/')">
        <component class="inline" :is="useRenderIcon(HomeFilled)" />
        <el-text
          style="position: relative; bottom: 1px; left: 8px"
          v-if="path === '/'"
          >/</el-text
        >
      </el-breadcrumb-item>

      <el-breadcrumb-item
        v-for="(dir, index) in dirs"
        :key="dir.path"
        @click="handleClick(dir.path)"
        :replace="index === dirs.length - 1"
      >
        {{ dir.name }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import HomeFilled from "@iconify-icons/ep/home-filled";

const emits = defineEmits(["click"]);
const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const dirs = computed(() => {
  const paths = props.path.split("/").filter(p => !!p);
  return paths.map((path, index) => {
    return {
      name: path,
      path: `/${paths.slice(0, index + 1).join("/")}`
    };
  });
});

const handleClick = (path: string) => {
  if (path === props.path) {
    return;
  }
  emits("click", path);
};
</script>

<style scoped>
:deep(.el-breadcrumb__inner:hover) {
  /* height: 14px;
    line-height: 14px;
    font-size: 14px;
    color: #909399; */
  cursor: pointer;
}
</style>
