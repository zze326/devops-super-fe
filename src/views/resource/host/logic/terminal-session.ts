import { FormDataProps } from "./types";
import { ref, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  getPageLstApi,
  checkSessionFileApi
} from "@/api/resource/host-terminal-session";
import { ReqPagerData } from "@/utils/pager";
import { PaginationProps } from "@pureadmin/table";
import { useStore } from "./store";
import { confirm } from "@/utils/generic";
import router from "@/router";

export const useLogic = () => {
  const loading = ref(false);
  const dataList = ref([]);
  const hostGroupTreeLoading = ref(false);
  const hostGroupTreeList = ref([]);
  const store = useStore();

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    // {
    //   label: "编号",
    //   prop: "id"
    // },
    {
      label: "主机名称",
      prop: "hostName"
    },
    {
      label: "主机地址",
      prop: "hostAddr"
    },
    {
      label: "操作人",
      prop: "operatorRealName"
    },
    {
      label: "开始时间",
      prop: "startTime",
      width: "160"
    },
    {
      label: "结束时间",
      prop: "updatedAt",
      width: "160"
    },
    {
      label: "操作",
      fixed: "right",
      width: 100,
      slot: "operation"
    }
  ];

  const onSearch = async () => {
    loading.value = true;
    const { data } = await getPageLstApi(
      new ReqPagerData(
        pagination.currentPage,
        pagination.pageSize,
        queryFormData.search,
        {
          hostGroupId: queryFormData.hostGroupId
        }
      )
    );
    dataList.value = data.list;
    pagination.total = data.total;
    loading.value = false;
  };

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  const queryFormData = reactive({ search: "", hostGroupId: null });

  // 回放记录
  const handleReplay = async (row: FormDataProps) => {
    const res = await checkSessionFileApi(row.id || 0);
    if (!res.data.exists) {
      ElMessage.error("回放文件不存在");
      return;
    }

    if (!(await confirm("将在新标签页打开回放终端，是否确认？"))) {
      return;
    }
    const { href } = router.resolve({
      name: "host-terminal-single",
      query: {
        id: row.id,
        mode: "replay"
      }
    });
    window.open(href, "_blank");
  };

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    dataList,
    columns,
    queryFormData,
    pagination,
    hostGroupTreeLoading,
    hostGroupTreeList,
    store,
    onSearch,
    resetForm,
    handleReplay
  };
};
