import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  config: string;
};

/** 新增 Kubernetes Config */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/kubernetes-config", { data });

/** 分页获取 Kubernetes Config 列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>(
    "get",
    "/kubernetes-config/page-list",
    {
      params: data
    }
  );

/** 更新 Kubernetes Config */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/kubernetes-config/${id}`, { data });

/** 删除 Kubernetes Config */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/kubernetes-config/${id}`);

/** 获取所有 Kubernetes Config 列表 */
export const getLstApi = () =>
  http.request<Resp<{ list: Partial<Model>[] }>>(
    "get",
    "/kubernetes-config/list"
  );

/** 获取所有 Kubernetes Config 列表（部分字段） */
export const getPartialLstApi = () =>
  http.request<Resp<{ list: Partial<Model>[] }>>(
    "get",
    "/kubernetes-config/partial-list"
  );
