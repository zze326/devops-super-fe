import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormItemProps } from "./types";
import { requiredRule } from "@/utils/formRules";

export const rules = reactive(<FormRules>{
  name: [requiredRule("部门标题为必填项")],
  rank: [requiredRule("排序为必填项")]
});

export const initValues = (row?: FormItemProps): FormItemProps => {
  return {
    parentId: row?.parentId ?? 0,
    name: row?.name ?? "",
    rank: row?.rank ?? 0
  };
};
