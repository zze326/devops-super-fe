import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  config: [
    { required: true, message: "配置内容为必填项", trigger: "blur" },
    {
      pattern: /^apiVersion:.*/,
      message: "配置内容格式错误",
      trigger: "blur"
    }
  ]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    config: row?.config ?? ""
  };
};
