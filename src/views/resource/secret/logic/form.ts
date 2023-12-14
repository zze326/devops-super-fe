import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormDataProps } from "./types";
import { ESecretType } from "@/api/resource/secret";
import { testConnectApi } from "@/api/common/kubernetes";
import { requiredRule, urlRule } from "@/utils/formRules";
import _ from "lodash";

/** 自定义表单规则校验 */
export const rules = reactive(<FormRules>{
  name: [requiredRule("名称为必填项")],
  type: [requiredRule("类型为必选项")]
});

export const kubernetesConfigRules = <FormRules>{
  text: [
    { required: true, message: "配置内容为必填项", trigger: "blur" },
    {
      pattern: /^apiVersion:.*/,
      message: "配置内容格式错误",
      trigger: "blur"
    },
    {
      validator: async (_rule, value, _callback) => {
        await testConnectApi({ config: value });
        return true;
      },
      trigger: "blur"
    }
  ]
};

export const usernamePasswordRules = <FormRules>{
  username: [requiredRule("用户名为必填项")],
  password: [requiredRule("密码必填项")]
};

export const dockerRegistryRules = _.merge(
  <FormRules>{
    registryUrl: [requiredRule("仓库地址为必填项"), urlRule()]
  },
  usernamePasswordRules
);

export const dynamicContentRules = (formData: FormDataProps) => {
  switch (formData.type) {
    case ESecretType.KUBERNETES_CONFIG:
      return kubernetesConfigRules;
    case ESecretType.GIT_BASIC_AUTH:
      return usernamePasswordRules;
    case ESecretType.DOCKER_REGISTRY_AUTH:
      return dockerRegistryRules;
  }
};

export const initValues = (row?: FormDataProps): FormDataProps => {
  return {
    name: row?.name ?? "",
    type: row?.type ?? null,
    content: row?.content ?? {}
  };
};
