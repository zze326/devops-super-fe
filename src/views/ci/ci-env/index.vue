<script setup lang="ts">
import { ref } from "vue";

import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { useLogic } from "./logic/logic";
import { Permiss } from "./logic/types";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "ci-env-manage"
});
const queryFormRef = ref();

const {
  loading,
  dataList,
  columns,
  queryFormData,
  pagination,
  openDialog,
  onSearch,
  resetForm,
  handleDelete
} = useLogic();
</script>
<template>
  <div class="main">
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
          placeholder="请输入构建环境名称"
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

    <PureTableBar title="构建环境列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          v-auth="Permiss.ADD"
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增构建环境
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
            </Auth>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
