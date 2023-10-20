import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  image: [
    { required: true, message: "镜像地址为必填项", trigger: "blur" },
    {
      pattern:
        /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*(?:\/[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*)*(:[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*)?$/,
      message: "请输入合法镜像地址",
      trigger: "blur"
    }
  ],
  secretName: [
    {
      pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/g,
      message: "请输入合法的 Kubernetes Secret 名称",
      trigger: "blur"
    }
  ]
});

export const persistenceFormRules = reactive<FormRules>({
  pvcName: [
    { required: true, message: "PVC 名称为必填项", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9-]+$/,
      message: "PVC 名称不能包含中文，且不能包含特殊字符（-除外）",
      trigger: "blur"
    }
  ],
  mountPath: [
    { required: true, message: "挂载路径为必填项", trigger: "blur" },
    {
      pattern: /^\/(?:[^/]+\/)*[^/]+$/,
      message: "挂载路径必须是绝对路径",
      trigger: "blur"
    }
  ]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    image: row?.image ?? "",
    secretName: row?.secretName ?? "",
    persistenceConfig: row?.persistenceConfig
  };
};
