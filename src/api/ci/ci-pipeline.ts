import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  desc: string;
  kubernetesConfigId: number;
  config: any;
};

/** 新增流水线 */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/ci-pipeline", { data });

/** 分页获取流水线列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>("get", "/ci-pipeline/page-list", {
    params: data
  });

/** 更新流水线 */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/ci-pipeline/${id}`, { data });

/** 删除流水线 */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/ci-pipeline/${id}`);

/** 获取所有流水线列表 */
export const getLstApi = () =>
  http.request<Resp<{ list: Partial<Model>[] }>>("get", "/ci-pipeline/list");
