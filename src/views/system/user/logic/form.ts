import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps, ResetPwdFormDataProps } from "./types";
import { emailRule, phoneRule, requiredRule } from "@/utils/formRules";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  username: [requiredRule("用户名为必填项")],
  realName: [requiredRule("真实姓名为必填项")],
  deptId: [requiredRule("所属部门为必填项")],
  phone: [phoneRule()],
  email: [emailRule()]
});

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    username: row?.username ?? "",
    realName: row?.realName ?? "",
    phone: row?.phone ?? "",
    email: row?.email ?? "",
    deptId: row?.deptId ?? null,
    enabled: row?.enabled ?? false,
    roleIds: row?.roleIds ?? []
  };
};

export const initResetPwdFormValues = (): ResetPwdFormDataProps => {
  return {
    password: "",
    passwordConfirm: ""
  };
};
