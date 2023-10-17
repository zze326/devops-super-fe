import { Permiss } from "./types";
import { watch, ref, onMounted, reactive, h, onUnmounted } from "vue";
import { getPageLstApi } from "@/api/ci/ci-pipeline-run";
import { ReqPagerData } from "@/utils/pager";
import { PaginationProps } from "@pureadmin/table";
import { hasAuth } from "@/router/utils";
import { useStore } from "./store";
import CheckboxCircleFill from "@iconify-icons/ri/checkbox-circle-fill";
import CloseCircleFill from "@iconify-icons/ri/close-circle-fill";
import BubbleLoading from "@/assets/svg/bubble-loading.svg?component";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getWsProtocol } from "@/utils/generic";
import { getToken } from "@/utils/auth";

export const useLogic = () => {
  const loading = ref(false);
  const dataList = ref([]);
  const store = useStore();

  const state = reactive({
    logDrawerVisible: false,
    logWsUrl: "",
    listInterval: null
  });

  const tokenInfo = getToken();

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 15,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "编号",
      prop: "id",
      minWidth: 60
    },
    {
      label: "任务名称",
      prop: "podName",
      minWidth: 200
    },
    {
      label: "状态",
      prop: "status",
      width: 60,
      cellRenderer: ({ row }) => {
        const statusColor = {
          0: "gray",
          1: "#55B63D",
          2: "#EC3E45"
        };

        const statusIcon = {
          0: BubbleLoading,
          1: CheckboxCircleFill,
          2: CloseCircleFill
        };
        return (
          <p class="flex justify-center">
            {h(
              useRenderIcon(statusIcon[row.status], {
                color: statusColor[row.status]
              })
            )}
          </p>
        );
      }
    },
    {
      label: "创建时间",
      prop: "createdAt",
      width: 160
    },
    {
      label: "更新时间",
      prop: "updatedAt",
      width: 160
    },
    {
      label: "操作",
      fixed: "right",
      width: 80,
      slot: "operation",
      hide: !hasAuth([Permiss.LOG], true)
    }
  ];

  const onSearch = async () => {
    if (!hasAuth(Permiss.READ)) return;
    loading.value = true;
    let wheres = {};
    if (store.current) {
      wheres = {
        pipelineId: store.current.id
      };
    }
    const { data } = await getPageLstApi(
      new ReqPagerData(
        pagination.currentPage,
        pagination.pageSize,
        null,
        wheres
      )
    );
    dataList.value = data.list;
    pagination.total = data.total;
    loading.value = false;
  };

  watch(() => store.current, onSearch);
  watch(() => store.historyCounter, onSearch);

  const handleLog = row => {
    state.logWsUrl = `${getWsProtocol()}://${
      import.meta.env.VITE_BASE_URL
    }/ci-pipeline-run/${row.id}/log?token=${tokenInfo.token}`;
    state.logDrawerVisible = true;
  };

  onMounted(() => {
    onSearch();
    state.listInterval = setInterval(onSearch, 7000);
  });

  onUnmounted(() => {
    clearInterval(state.listInterval);
  });

  return {
    loading,
    dataList,
    columns,
    pagination,
    store,
    state,
    onSearch,
    handleLog
  };
};
