import { http } from "@/utils/http";
/** 新增构建环境 */
export const testConnectKubernetesApi = (data: { config: string }) =>
  http.request<Resp<null>>("post", "/common/kubernetes/test-connect", { data });
