import { http } from "@/utils/http";
/** 新增构建环境 */
export const testConnectApi = (data: { config: string }) =>
  http.request<Resp<null>>("post", "/kubernetes/test-connect", { data });
