import { ElMessageBox } from "element-plus";

export const toLogin = () => {
  location.href = "/#/login";
  location.reload();
};

export const getWsProtocol = (url: string | null = null): string => {
  // 如果没有指定 URL，则使用当前页面的 URL
  if (!url) {
    url = window.location.href;
  }

  // 根据 URL 的协议返回对应的 WebSocket 协议
  const isSecure = url.startsWith("https");
  return isSecure ? "wss" : "ws";
};

export const getHttpProtocol = (url: string | null = null): string => {
  // 如果没有指定 URL，则使用当前页面的 URL
  if (!url) {
    url = window.location.href;
  }

  // 根据 URL 的协议返回对应的 WebSocket 协议
  const isSecure = url.startsWith("https");
  return isSecure ? "https" : "http";
};

export const confirm = async (message, title?: string) => {
  return (
    (await ElMessageBox.confirm(message, title ?? "系统提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }).catch(_ => false)) == "confirm"
  );
};

// 字节转可读
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 获取当前 host，如 http://ds-demo.zze.xyz
export function getCurrentHost(protocol = window.location.protocol) {
  if (!import.meta.env.VITE_BASE_URL) {
    return window.location.host;
  } else {
    if (!protocol.endsWith(":")) protocol = `${protocol}:`;
    return `${protocol}//${import.meta.env.VITE_BASE_URL}`;
  }
}
