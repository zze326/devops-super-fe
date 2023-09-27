import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps, ResetPwdFormDataProps } from "./types";

export const dynamicRules = (formData: FormDataProps) => {
  const rules = reactive(<FormRules>{
    username: [
      { required: true, message: "连接用户名为必填项", trigger: "blur" }
    ],
    name: [
      { required: true, message: "主机标识名称为必填项", trigger: "blur" }
    ],
    hostAddr: [
      { required: true, message: "主机名必填项", trigger: "blur" },
      {
        pattern: /^[a-zA-Z0-9.-]+$/,
        message: "请输入合法的主机名或 IP 地址",
        trigger: "blur"
      }
    ],
    port: [{ required: true, message: "端口为必填项", trigger: "blur" }]
  });

  if (formData.useKey) {
    Object.assign(rules, {
      privateKey: [
        { required: true, message: "连接秘钥为必填项", trigger: "blur" },
        {
          pattern:
            /^(-----BEGIN OPENSSH PRIVATE KEY-----)\n([A-Za-z0-9+/=\s]+)\n(-----END OPENSSH PRIVATE KEY-----)$/,
          message: "请输入合法的私钥文本",
          trigger: "blur"
        }
      ]
    });
  } else {
    Object.assign(rules, {
      password: [
        { required: true, message: "连接密码为必填项", trigger: "blur" }
      ]
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
