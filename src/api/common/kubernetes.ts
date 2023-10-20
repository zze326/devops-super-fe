import { http } from "@/utils/http";
/** 测试 kubernetes 配置能否正常连接到集群 */
export const testConnectApi = (data: { config: string }) =>
  http.request<Resp<null>>("post", "/kubernetes/test-connect", { data });

// 根据 kubernetes 秘钥 id 获取集群命名空间列表
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

// 获取 kubernetes 集群中指定名称空间的 pvc
export const getPvcLstApi = (secretId: number, namespace: string) =>
  http.request<Resp<{ pvcs: string[] }>>(
    "get",
    "/kubernetes/persistent-volume-claim/list",
    {
      params: {
        secretId,
        namespace
      }
    }
  );
