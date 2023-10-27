<script setup lang="ts">
import { ref } from "vue";

import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import More from "@iconify-icons/ep/more";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import ArrowDown from "@iconify-icons/ep/arrow-down";
import Play from "@iconify-icons/ri/play-line";
import Operation from "@iconify-icons/ep/operation";
import { useLogic } from "./logic/logic";
import { Permiss } from "./logic/types";
import { hasAuth } from "@/router/utils";
import Arrange from "./components/Arrange.vue";
import { FormInstance, TableInstance } from "element-plus";

const queryFormRef = ref<FormInstance>();
const tableRef = ref<TableInstance>();

const {
  loading,
  dataList,
  columns,
  queryFormData,
  pagination,
  openDialog,
  onSearch,
  resetForm,
  handleArrange,
  handleRun,
  handleRowClick,
  handleMoreCommand,
  store
} = useLogic(tableRef);
</script>
<template>
  <el-form
    ref="queryFormRef"
    v-auth="Permiss.READ"
    :inline="true"
    :model="queryFormData"
    @submit.prevent
    class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
  >
    <el-form-item label="名称：" prop="search">
      <el-input
        v-model="queryFormData.search"
        placeholder="请输入流水线名称"
        clearable
        class="!w-[200px]"
        @keyup.enter="onSearch"
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

  <PureTableBar title="流水线列表" :columns="columns" @refresh="onSearch">
    <template #buttons>
      <el-button
        v-auth="Permiss.ADD"
        type="primary"
        :icon="useRenderIcon(AddFill)"
        @click="openDialog()"
      >
        新增流水线
      </el-button>
    </template>
    <template v-slot="{ size, dynamicColumns }">
      <pure-table
        ref="tableRef"
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
        highlight-current-row
        @row-click="handleRowClick"
        @page-size-change="onSearch"
        @page-current-change="onSearch"
        :paginationSmall="size === 'small' ? true : false"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)'
        }"
      >
        <template #operation="{ row }">
          <div class="flex flex-wrap items-center">
            <el-button
              v-auth="Permiss.RUN"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Play)"
              @click="handleRun(row)"
            >
              运行
            </el-button>
            <el-button
              v-auth="Permiss.ARRANGE"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Operation)"
              @click="handleArrange(row)"
            >
              编排
            </el-button>
            <el-dropdown @command="handleMoreCommand($event, row)">
              <span>
                <component :is="useRenderIcon(More)" />
                <el-text>更多</el-text>
                <component :is="useRenderIcon(ArrowDown)" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="clone">克隆</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- <el-button
            v-auth="Permiss.UPT"
            class="reset-margin"
            link
            type="primary"
            :size="size"
            :icon="useRenderIcon(EditPen)"
            @click="openDialog('编辑', row)"
          >
            编辑
          </el-button>
          <Auth :value="Permiss.DEL">
            <el-popconfirm
              :title="`是否确认删除名称为 ${row.name} 的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </Auth> -->
        </template>
      </pure-table>
    </template>
  </PureTableBar>
  <Arrange v-if="store.arrangeVisible" />
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.el-dropdown {
  margin-left: 12px;

  span {
    display: flex;
    align-items: center;
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .el-text {
    margin: 0 1px;
    font-weight: var(--el-font-weight-primary);
    color: var(--el-color-primary);
  }
}
</style>
