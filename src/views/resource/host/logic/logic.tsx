import editForm from "../form.vue";
import { addDialog } from "@/components/ReDialog";
import { FormDataProps, Permiss } from "./types";
import { hasAuth } from "@/router/utils";
import { initValues } from "./form";
import { h, ref, onMounted, reactive } from "vue";
import { FormInstance } from "element-plus";
import { message } from "@/utils/message";
import {
  addApi,
  uptApi,
  getPageLstApi,
  delApi,
  testSshApi
} from "@/api/resource/host";
import {
  getLstApi as getHostGroupLstApi,
  getLstPartialApi as getHostGroupPartialLstApi
} from "@/api/resource/host-group";
import { ReqPagerData } from "@/utils/pager";
import { PaginationProps } from "@pureadmin/table";
import { handleTree } from "@/utils/tree";
import { confirm } from "@/utils/generic";
import router from "@/router";
import { useStore } from "./store";

export const useLogic = () => {
  const formRef = ref();
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
      prop: "name"
    },
    {
      label: "主机地址",
      prop: "hostAddr"
    },
    {
      label: "描述",
      prop: "desc"
    },
    {
      label: "更新时间",
      prop: "updatedAt"
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation",
      hide: !hasAuth([Permiss.UPT, Permiss.DEL, Permiss.TERMINAL_CONNECT], true)
    }
  ];

  const onSearch = async () => {
    if (!hasAuth(Permiss.READ)) return;
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

  // 打开新增、编辑框
  const openDialog = async (title = "新增", row?: FormDataProps) => {
    const res = await getHostGroupLstApi(null);
    addDialog({
      title: `${title}主机`,
      props: {
        formData: initValues(row),
        hostGroupTreeList: handleTree(res.data.list)
      },
      width: "35%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const ok = await (formRef.value.getRef() as FormInstance).validate();
        const formData = options.props.formData as FormDataProps;
        const chores = (result: Resp<null>) => {
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          if (title === "新增") {
            message(
              `您${title}了主机名为 ${formData.username} 的这条数据，默认密码为 devops.123`,
              {
                type: "success"
              }
            );
          } else {
            message(`您${title}了主机名为 ${formData.username} 的这条数据`, {
              type: "success"
            });
          }

          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        };
        if (!ok) {
          return;
        }

        chores(
          title === "新增"
            ? await addApi(formData)
            : await uptApi(row.id, formData)
        );
      }
    });
  };

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  const queryFormData = reactive({ search: "", hostGroupId: null });

  const handleDelete = async (row: FormDataProps) => {
    const res = await delApi(row.id);
    if (res.code !== 0) {
      message(res.message, { type: "error" });
      return;
    }
    message(`您删除了主机名为 ${row.username} 的这条数据`, { type: "success" });
    onSearch();
  };

  const getHostGroupTree = async () => {
    hostGroupTreeLoading.value = true;
    const res = await getHostGroupPartialLstApi();
    hostGroupTreeList.value = handleTree(res.data.list);
    hostGroupTreeLoading.value = false;
  };

  const onHostGroupTreeSelect = ({ id, selected }) => {
    queryFormData.hostGroupId = selected ? id : null;
    onSearch();
  };

  const toTerminalSingle = async (
    row: Required<FormDataProps & { loading: boolean }>
  ) => {
    row.loading = true;
    const res = await testSshApi(row.id).catch(() => false);
    row.loading = false;
    if (!res) {
      return;
    }
    if (!(await confirm("将在新标签页打开终端，是否确认？"))) {
      return;
    }
    const { href } = router.resolve({
      name: "host-terminal-single",
      query: {
        id: row.id
      }
    });
    window.open(href, "_blank");
  };

  const showTerminalSessionDrawer = () => {
    store.terminalSessionDrawerVisible = true;
  };

  onMounted(() => {
    if (!hasAuth(Permiss.READ)) return;
    onSearch();
    getHostGroupTree();
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
    openDialog,
    onSearch,
    resetForm,
    handleDelete,
    onHostGroupTreeSelect,
    toTerminalSingle,
    showTerminalSessionDrawer
  };
};
