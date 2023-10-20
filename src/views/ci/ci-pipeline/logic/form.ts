import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";

/** 自定义表单规则校验 */
export const rules = reactive<FormRules>({
  name: [
    { required: true, message: "名称为必填项", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9-]+$/,
      message: "名称不能包含中文，且不能包含特殊字符（-除外）",
      trigger: "blur"
    }
  ],
  kubernetesConfigId: [
    { required: true, message: "Kubernetes 集群为必选项", trigger: "blur" }
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
    kubernetesConfigId: row?.kubernetesConfigId,
    kubernetesNamespace: row?.kubernetesNamespace ?? "",
    persistenceConfig: row?.persistenceConfig,
    desc: row?.desc ?? ""
  };
};
