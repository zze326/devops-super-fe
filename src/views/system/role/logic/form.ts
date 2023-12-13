import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";
import {
  noChineseIgnoreMidLineAndBottomLineRule,
  requiredRule
} from "@/utils/formRules";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [requiredRule("角色名称为必填项")],
  code: [
    requiredRule("代码为必填项"),
    noChineseIgnoreMidLineAndBottomLineRule(
      "角色代码不能包含中文，且不能包含特殊字符（-、_除外）"
    )
  ]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    code: row?.code ?? ""
  };
};
