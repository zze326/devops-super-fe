import { http } from "@/utils/http";
/** 新增构建环境 */
export const testConnectApi = (data: { config: string }) =>
  http.request<Resp<null>>("post", "/kubernetes/test-connect", { data });

// 根据 Kubernetes 秘钥 id 获取集群命名空间列表
export const getNamespaceLstApi = (secretId: number) =>
  http.request<Resp<{ namespaces: string[] }>>(
    "get",
    "/kubernetes/namespace/list",
    {
      params: {
        secretId
      }
    }
  );
