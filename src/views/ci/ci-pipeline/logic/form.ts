import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";
import { noChineseIgnoreMidLineRule, requiredRule } from "@/utils/formRules";

/** 自定义表单规则校验 */
export const rules = reactive<FormRules>({
  name: [
    requiredRule("名称为必填项"),
    noChineseIgnoreMidLineRule("名称不能包含中文，且不能包含特殊字符（-除外）")
  ],
  kubernetesConfigId: [requiredRule("Kubernetes 集群为必选项")]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    kubernetesConfigId: row?.kubernetesConfigId,
    kubernetesNamespace: row?.kubernetesNamespace ?? "",
    parameterize: row?.parameterize ?? false,
    desc: row?.desc ?? ""
  };
};
