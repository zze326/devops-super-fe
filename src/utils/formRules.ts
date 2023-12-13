export const requiredRule = (message = "必填项", trigger = "blur") => {
  return {
    required: true,
    message,
    trigger
  };
};

export const imageUrlRule = (
  message = "镜像地址格式不正确",
  trigger = "blur"
) => {
  return {
    pattern:
      /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*(?:\/[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*)*(:[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*)?$/,
    message,
    trigger
  };
};

export const relativePathFileRule = (
  message = "文件路径必须是相对路径",
  trigger = "blur"
) => {
  return {
    pattern: /^(?!\/)(?:[^/]+\/)*[^/]+$/,
    message,
    trigger
  };
};

export const relativePathRule = (
  message = "必须是相对路径",
  trigger = "blur"
) => {
  return {
    pattern: /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    message,
    trigger
  };
};

export const gitUrlRule = (
  message = "请输入合法的 Git URL",
  trigger = "blur"
) => {
  return {
    pattern: /^(git|https?|ssh):\/\/[^\s]+$/i,
    message,
    trigger
  };
};

export const absolutePathRule = (
  message = "必须是绝对路径",
  trigger = "blur"
) => {
  return {
    pattern: /^\/(?:[^/]+\/)*[^/]+$/,
    message,
    trigger
  };
};

export const noChineseIgnoreMidLineRule = (
  message = "不能包含中文和特殊字符（-除外）",
  trigger = "blur"
) => {
  return {
    pattern: /^[A-Za-z0-9-]+$/,
    message,
    trigger
  };
};

export const noChineseIgnoreMidLineAndBottomLineRule = (
  message = "不能包含中文和特殊字符（-、_除外）",
  trigger = "blur"
) => {
  return {
    pattern: /^[A-Za-z0-9\-_]+$/,
    message,
    trigger
  };
};

export const resourceNameRule = (message = "名称不合法", trigger = "blur") => {
  return {
    pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/g,
    message,
    trigger
  };
};

export const hostnameOrIpRule = (
  message = "请输入合法的主机名或 IP 地址",
  trigger = "blur"
) => {
  return {
    pattern: /^[a-zA-Z0-9.-]+$/,
    message,
    trigger
  };
};

export const opensshPrivateKeyRule = (
  message = "请输入合法的私钥文本",
  trigger = "blur"
) => {
  return {
    pattern:
      /^(-----BEGIN OPENSSH PRIVATE KEY-----)\n([A-Za-z0-9+/=\s]+)\n(-----END OPENSSH PRIVATE KEY-----)$/,
    message,
    trigger
  };
};

export const phoneRule = (message = "电话号码格式不正确", trigger = "blur") => {
  return {
    pattern: /^1\d{10}$/,
    message,
    trigger
  };
};

export const emailRule = (message = "邮箱格式不正确", trigger = "blur") => {
  return {
    pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
    message,
    trigger
  };
};
