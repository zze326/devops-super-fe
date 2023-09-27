<script setup lang="ts">
import { ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import CaretRight from "@iconify-icons/ep/caret-right";
import { useLogic } from "./logic/terminal-session";
import { Permiss } from "./logic/types";
import { hasAuth } from "@/router/utils";

const queryFormRef = ref();

const {
  loading,
  dataList,
  columns,
  queryFormData,
  pagination,
  store,
  onSearch,
  resetForm,
  handleReplay
} = useLogic();
</script>
<template>
  <el-drawer
    destroy-on-close
    @open="onSearch"
    v-model="store.terminalSessionDrawerVisible"
    title="终端会话记录"
    direction="rtl"
    size="50%"
  >
    <el-form
      ref="queryFormRef"
      v-auth="Permiss.TERMINAL_SESSION_READ"
      :inline="true"
      :model="queryFormData"
      @submit.prevent
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="主机：" prop="search">
        <el-input
          v-model="queryFormData.search"
          placeholder="请输入主机名称/地址"
          clearable
          @keyup.enter="onSearch"
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(queryFormRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="会话记录列表" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :data="dataList"
          :empty-text="
            hasAuth(Permiss.TERMINAL_SESSION_READ) ? '暂无数据' : '权限不足'
          "
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
              class="reset-margin"
              link
              type="primary"
              v-auth="Permiss.TERMINAL_SESSION_REPLAY"
              :size="size"
              :icon="useRenderIcon(CaretRight)"
              :loading="row.loading"
              @click="handleReplay(row)"
            >
              回放
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </el-drawer>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
