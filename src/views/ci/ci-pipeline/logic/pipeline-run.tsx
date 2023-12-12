import { Permiss } from "./types";
import { watch, ref, onMounted, reactive, h, onUnmounted } from "vue";
import { PaginationProps } from "@pureadmin/table";
import { hasAuth } from "@/router/utils";
import { useStore } from "./store";
import { cancelApi } from "@/api/ci/ci-pipeline-run";
import CheckboxCircleFill from "@iconify-icons/ri/checkbox-circle-fill";
import CloseCircleFill from "@iconify-icons/ri/close-circle-fill";
import BubbleLoading from "@/assets/svg/bubble-loading.svg?component";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getCurrentHost, getWsProtocol } from "@/utils/generic";
import { getToken } from "@/utils/auth";
import { message } from "@/utils/message";

export const useLogic = () => {
  const loading = ref(false);
  const dataList = ref([]);
  const store = useStore();

  const state = reactive({
    logDrawerVisible: false,
    logWsUrl: "",
    pageLstInterval: null
  });

  const tokenInfo = getToken();
  const wsUrl = `${getCurrentHost(
    getWsProtocol()
  )}/ci-pipeline-run/page-list?token=${tokenInfo.token}`;

  const ws = new WebSocket(wsUrl);

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 15,
    currentPage: 1,
    background: true,
    layout: "total, sizes, pager, jumper"
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
          2: "#EC3E45",
          3: "gray"
        };

        const statusIcon = {
          0: BubbleLoading,
          1: CheckboxCircleFill,
          2: CloseCircleFill,
          3: CloseCircleFill
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
      align: "center",
      width: 138,
      slot: "operation",
      hide: !hasAuth([Permiss.LOG, Permiss.CANCEL], true)
    }
  ];

  const handleLog = row => {
    state.logWsUrl = `${getCurrentHost(getWsProtocol())}/ci-pipeline-run/${
      row.id
    }/log?token=${tokenInfo.token}`;
    state.logDrawerVisible = true;
  };

  const handleCancel = async row => {
    await cancelApi(row.id);
    onSearch();
    message("操作成功", { type: "success" });
  };

  const onSearch = () => {
    if (!hasAuth(Permiss.READ)) return;
    loading.value = true;
    let wheres = {};
    if (store.current) {
      wheres = {
        pipelineId: store.current.id
      };
    }
    const reqData = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      wheres
    };
    ws.send(JSON.stringify(reqData));
  };

  watch(() => store.current, onSearch);
  watch(() => store.historyCounter, onSearch);

  onMounted(() => {
    ws.onopen = () => {
      onSearch();
      state.pageLstInterval = setInterval(onSearch, 5000);
    };
    ws.onclose = () => {
      console.log("连接已断开");
    };
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      dataList.value = data.list;
      pagination.total = data.total;
      loading.value = false;
    };
  });

  onUnmounted(() => {
    ws.close();
  });

  return {
    loading,
    dataList,
    columns,
    pagination,
    store,
    state,
    onSearch,
    handleLog,
    handleCancel
  };
};
