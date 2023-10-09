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

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    image: row?.image ?? "",
    secretName: row?.secretName ?? ""
  };
};
