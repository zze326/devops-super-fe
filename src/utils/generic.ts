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
  if (!protocol.endsWith(":")) protocol = `${protocol}:`;
  if (!import.meta.env.VITE_BASE_URL) {
    return `${protocol}//${window.location.host}`;
  } else {
    return `${protocol}//${import.meta.env.VITE_BASE_URL}`;
  }
}

export function formatDuration(duration: number): string {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  let formatted = "";
  if (days > 0) {
    formatted += `${days}d`;
  }
  if (hours > 0) {
    formatted += `${hours}h`;
  }
  if (minutes > 0) {
    formatted += `${minutes}m`;
  }
  if (seconds > 0) {
    formatted += `${seconds}s`;
  }

  return formatted;
}

export function calculateDuration(startTime: Date, endTime: Date): string {
  const diff = endTime.getTime() - startTime.getTime();
  return formatDuration(diff);
}
