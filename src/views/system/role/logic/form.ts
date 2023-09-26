import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [{ required: true, message: "角色名称为必填项", trigger: "blur" }],
  code: [
    { required: true, message: "代码为必填项", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9\-_]+$/,
      message: "角色代码不能包含中文，且不能包含特殊字符（-、_除外）",
      trigger: "blur"
    }
  ]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    code: row?.code ?? ""
  };
};
