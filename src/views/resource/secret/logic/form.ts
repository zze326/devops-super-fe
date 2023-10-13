import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";
import { ESecretType } from "@/api/resource/secret";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  type: [{ required: true, message: "类型为必选项", trigger: "blur" }]
});

export const textRules = reactive(<FormRules>{
  text: [
    { required: true, message: "配置内容为必填项", trigger: "blur" },
    {
      pattern: /^apiVersion:.*/,
      message: "配置内容格式错误",
      trigger: "blur"
    }
  ]
});

export const usernamePasswordRules = reactive(<FormRules>{
  username: [{ required: true, message: "用户名为必填项", trigger: "blur" }],
  password: [{ required: true, message: "密码必填项", trigger: "blur" }]
});

export const dynamicContentRules = (formData: FormDataProps) => {
  switch (formData.type) {
    case ESecretType.KUBERNETES_CONFIG:
      return textRules;
    case ESecretType.GIT_BASIC_AUTH:
      return usernamePasswordRules;
  }
};

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    type: row?.type ?? null,
    content: row?.content ?? {}
  };
};
