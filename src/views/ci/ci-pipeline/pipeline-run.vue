<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Log24 from "@/assets/svg/log-24.svg?component";
import Close from "@iconify-icons/ri/close-circle-line";
import { useLogic } from "./logic/pipeline-run";
import { Permiss } from "./logic/types";
import { hasAuth } from "@/router/utils";
import Log from "@/components/LogTerminal.vue";

const {
  loading,
  dataList,
  columns,
  pagination,
  state,
  onSearch,
  handleLog,
  handleCancel
} = useLogic();
</script>
<template>
  <PureTableBar
    style="margin-top: 0"
    title="运行历史"
    :columns="columns"
    @refresh="onSearch"
  >
    <template v-slot="{ size, dynamicColumns }">
      <pure-table
        align-whole="center"
        showOverflowTooltip
        table-layout="auto"
        :loading="loading"
        :size="size"
        adaptive
        :empty-text="hasAuth(Permiss.READ) ? '没有数据' : '权限不足'"
        :data="dataList"
        :columns="dynamicColumns"
        :pagination="pagination"
        @page-size-change="onSearch"
        @page-current-change="onSearch"
        :paginationSmall="size === 'small' ? true : false"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)'
        }"
      >
        <template #operation="{ row }">
          <el-button
            v-auth="Permiss.LOG"
            class="reset-margin"
            v-if="row.status !== 3"
            link
            type="primary"
            :size="size"
            :icon="useRenderIcon(Log24)"
            @click="handleLog(row)"
          >
            日志
          </el-button>
          <el-button
            v-auth="Permiss.CANCEL"
            v-if="row.status === 0"
            class="reset-margin"
            link
            type="primary"
            :size="size"
            :icon="useRenderIcon(Close)"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </pure-table>
    </template>
  </PureTableBar>

  <el-drawer
    v-if="state.logDrawerVisible"
    destroy-on-close
    v-model="state.logDrawerVisible"
    title="日志"
    size="35%"
  >
    <Log :padding-bottom="120" :ws-url="state.logWsUrl" />
  </el-drawer>
</template>
