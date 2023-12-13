import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";
import {
  imageUrlRule,
  relativePathFileRule,
  absolutePathRule,
  requiredRule,
  noChineseIgnoreMidLineRule,
  resourceNameRule
} from "@/utils/formRules";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [requiredRule("名称为必填项")],
  client: [requiredRule("是否是客户端为必选项")],
  image: [requiredRule("镜像地址为必填项"), imageUrlRule()],
  secretName: [resourceNameRule("Kubernetes Secret 名称格式不正确")]
});

export const persistenceFormRules = reactive<FormRules>({
  pvcName: [
    requiredRule("PVC 名称为必填项"),
    noChineseIgnoreMidLineRule("PVC 名称不能包含中文和特殊字符（-除外）")
  ],
  mountPath: [
    requiredRule("挂载路径为必填项"),
    absolutePathRule("挂载路径必须是绝对路径")
  ],
  subPath: [relativePathFileRule("挂载子路径必须是相对路径")]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    image: row?.image ?? "",
    secretName: row?.secretName ?? "",
    isKaniko: row?.isKaniko ?? false,
    persistenceConfig: row?.persistenceConfig
  };
};
