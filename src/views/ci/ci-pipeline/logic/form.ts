import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  kubernetesConfigId: [
    { required: true, message: "Kubernetes 集群为必选项", trigger: "blur" }
  ]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    kubernetesConfigId: row?.kubernetesConfigId,
    desc: row?.desc ?? ""
  };
};
