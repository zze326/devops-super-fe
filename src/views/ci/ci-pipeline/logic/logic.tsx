import editForm from "../form.vue";
import parameterizeForm from "../parameterize-form.vue";
import cloneForm from "../clone-form.vue";
import { addDialog } from "@/components/ReDialog";
import { FormDataProps, Permiss } from "./types";
import { initValues } from "./form";
import { h, ref, onMounted, reactive } from "vue";
import { TableInstance } from "element-plus";
import { confirm } from "@/utils/generic";
import { message } from "@/utils/message";
import {
  addApi,
  uptApi,
  getPageLstApi,
  delApi,
  runApi,
  cloneApi
} from "@/api/ci/ci-pipeline";
import {
  getLstApi as getSecretListApi,
  ESecretType
} from "@/api/resource/secret";
import { ReqPagerData } from "@/utils/pager";
import { PaginationProps } from "@pureadmin/table";
import { hasAuth } from "@/router/utils";
import { useStore } from "./store";

export const useLogic = tableRef => {
  const formRef = ref();
  const loading = ref(false);
  const dataList = ref([]);
  const store = useStore();

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
      label: "名称",
      prop: "name",
      minWidth: 100
    },
    {
      label: "描述",
      minWidth: 100,
      prop: "desc"
    },
    {
      label: "更新时间",
      prop: "updatedAt",
      width: 160
    },
    {
      label: "操作",
      align: "center",
      width: hasAuth(
        [Permiss.UPT, Permiss.CLONE, Permiss.DEL, Permiss.UPT],
        true
      )
        ? 210
        : 100,
      slot: "operation",
      hide: !hasAuth(
        [Permiss.UPT, Permiss.DEL, Permiss.ARRANGE, Permiss.RUN, Permiss.CLONE],
        true
      )
    }
  ];

  const onSearch = async () => {
    if (!hasAuth(Permiss.READ)) return;
    loading.value = true;
    const { data } = await getPageLstApi(
      new ReqPagerData(
        pagination.currentPage,
        pagination.pageSize,
        queryFormData.search
      )
    );
    dataList.value = data.list;
    pagination.total = data.total;
    loading.value = false;
  };

  // 打开新增、编辑框
  const openDialog = async (title = "新增", row?: FormDataProps) => {
    const res = await getSecretListApi({ type: ESecretType.KUBERNETES_CONFIG });
    addDialog({
      title: `${title}流水线`,
      props: {
        formData: initValues(row),
        kubernetesConfigs: res.data.list
      },
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const ok = await formRef.value.validate();
        const formData = options.props.formData as FormDataProps;
        const chores = (result: Resp<null>) => {
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message(`您${title}了名称为 ${formData.name} 的这条数据`, {
            type: "success"
          });

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

  const openParameterizeDialog = (row?: FormDataProps) => {
    addDialog({
      title: "运行流水线",
      props: {
        baseData: row.params,
        formData: {}
      },
      width: "20%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(parameterizeForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const ok = await formRef.value.validate();
        if (!ok) {
          return;
        }
        const formData = options.props.formData;

        await runApi(row.id, formData);
        store.reloadHistory();
        message("运行成功", { type: "success" });
        done();
      }
    });
  };

  const openCloneDialog = (row?: FormDataProps) => {
    addDialog({
      title: "克隆流水线",
      props: {
        formData: {}
      },
      width: "25%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(cloneForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const ok = await formRef.value.validate();
        if (!ok) {
          return;
        }
        const formData = options.props.formData;

        await cloneApi(row.id, formData.name);
        message("克隆成功", { type: "success" });
        done();
        onSearch();
      }
    });
  };

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    queryFormData.search = "";
    store.current = null;
    onSearch();
  };

  const queryFormData = reactive({ search: "" });

  const handleDelete = async (row: FormDataProps) => {
    const res = await delApi(row.id);
    if (res.code !== 0) {
      message(res.message, { type: "error" });
      return;
    }
    message(`您删除了名称为 ${row.name} 的这条数据`, { type: "success" });
    onSearch();
  };

  const handleArrange = (row: FormDataProps) => {
    store.id = row.id;
    store.arrangeCurrent = row;
    store.arrangeVisible = true;
  };

  const handleRun = async (row: FormDataProps) => {
    if (row.parameterize) {
      openParameterizeDialog(row);
    } else {
      await runApi(row.id);
      store.reloadHistory();
      message("运行成功", { type: "success" });
    }
  };

  const handleRowClick = (row: FormDataProps) => {
    if (store.current === row) {
      (tableRef.value.getTableRef() as TableInstance).setCurrentRow(null);
      store.current = null;
    } else {
      (tableRef.value.getTableRef() as TableInstance).setCurrentRow(row);
      store.current = row;
    }
  };

  const handleMoreCommand = async (command: string, row: FormDataProps) => {
    switch (command) {
      case "edit":
        openDialog("编辑", row);
        break;
      case "clone":
        openCloneDialog(row);
        break;
      case "delete":
        if (await confirm(`确认删除名称为 ${row.name} 的流水线？`)) {
          handleDelete(row);
        }
        break;
    }
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
    openDialog,
    onSearch,
    resetForm,
    handleDelete,
    handleArrange,
    handleRun,
    handleRowClick,
    handleMoreCommand,
    store
  };
};
