<script setup lang="ts">
import { ref } from "vue";
import tree from "./host-group-tree.vue";
import TerminalSession from "./terminal-session.vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Document from "@iconify-icons/ep/document";
import CaretRight from "@iconify-icons/ep/caret-right";
import { useLogic } from "./logic/logic";
import { Permiss } from "./logic/types";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "host-manage"
});

const queryFormRef = ref();

const {
  loading,
  dataList,
  columns,
  queryFormData,
  pagination,
  hostGroupTreeList,
  hostGroupTreeLoading,
  openDialog,
  onSearch,
  resetForm,
  handleDelete,
  onHostGroupTreeSelect,
  toTerminalSingle,
  showTerminalSessionDrawer
} = useLogic();
</script>
<template>
  <div class="flex justify-between">
    <TerminalSession />
    <tree
      ref="treeRef"
      class="min-w-[200px] mr-2"
      :treeData="hostGroupTreeList"
      :treeLoading="hostGroupTreeLoading"
      @tree-select="onHostGroupTreeSelect"
    />
    <div class="w-[calc(100%-200px)]">
      <el-form
        ref="queryFormRef"
        v-auth="Permiss.READ"
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

      <PureTableBar title="主机列表" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            v-auth="Permiss.TERMINAL_SESSION_READ"
            :icon="useRenderIcon(Document)"
            @click="showTerminalSessionDrawer"
            >终端会话记录</el-button
          >
          <el-button
            v-auth="Permiss.ADD"
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增主机
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            :data="dataList"
            :empty-text="hasAuth(Permiss.READ) ? '暂无数据' : '权限不足'"
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
                v-auth="Permiss.UPT"
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('编辑', row)"
              >
                修改
              </el-button>
              <Auth :value="Permiss.DEL">
                <el-popconfirm
                  :title="`是否确认删除用户名为 ${row.username} 的这条数据`"
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
              </Auth>

              <el-button
                class="reset-margin"
                link
                v-auth="Permiss.TERMINAL_CONNECT"
                type="primary"
                :size="size"
                :icon="useRenderIcon(CaretRight)"
                :loading="row.loading"
                @click="toTerminalSingle(row)"
              >
                终端
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>
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
