import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  desc: string;
  kubernetesConfigId: number;
  config: Config;
};

export type Config = ConfigEnvItem[];

export type ConfigEnvItem = {
  id: number;
  name?: string;
  stages: ConfigEnvStageItem[];
};

export type ConfigEnvStageItem = {
  name: string;
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

/** 更新流水线配置 */
export const uptConfigApi = (id: number, data: any) =>
  http.request<Resp<null>>("patch", `/ci-pipeline/${id}/config`, {
    data
  });

/** 获取流水线配置 */
export const getConfigApi = (id: number) =>
  http.request<Resp<{ config: Config; envMap: { id: number; name: string } }>>(
    "get",
    `/ci-pipeline/${id}/config`
  );
