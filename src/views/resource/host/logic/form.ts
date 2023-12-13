import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps, ResetPwdFormDataProps } from "./types";
import {
  hostnameOrIpRule,
  opensshPrivateKeyRule,
  requiredRule
} from "@/utils/formRules";

export const dynamicRules = (formData: FormDataProps) => {
  const rules = reactive(<FormRules>{
    username: [requiredRule("连接用户名为必填项")],
    name: [requiredRule("主机标识名称为必填项")],
    hostAddr: [requiredRule("主机名必填项"), hostnameOrIpRule()],
    port: [requiredRule("端口为必填项")]
  });

  if (formData.useKey) {
    Object.assign(rules, {
      privateKey: [requiredRule("连接秘钥为必填项"), opensshPrivateKeyRule()]
    });
  } else {
    Object.assign(rules, {
      password: [requiredRule("连接密码为必填项")]
    });
  }
  return rules;
};

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    hostAddr: row?.hostAddr ?? "",
    port: row?.port ?? 22,
    username: row?.username ?? "root",
    password: row?.password ?? "",
    privateKey: row?.privateKey ?? "",
    useKey: row?.useKey ?? false,
    desc: row?.desc ?? "",
    saveSession: row?.saveSession ?? false,
    hostGroupId: row?.hostGroupId ?? null
  };
};

export const initResetPwdFormValues = (): ResetPwdFormDataProps => {
  return {
    password: "",
    passwordConfirm: ""
  };
};
