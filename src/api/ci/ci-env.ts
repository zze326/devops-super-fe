import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  image: string;
  secretName: string;
  isKaniko: boolean;
  persistenceConfig: PersistenceConfig;
};
export type PersistenceConfig = PersistenceConfigItem[];

export type PersistenceConfigItem = {
  pvcName: string;
  mountPath: string;
  subPath: string;
};

/** 新增构建环境 */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/ci-env", { data });

/** 分页获取构建环境列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>("get", "/ci-env/page-list", {
    params: data
  });

/** 更新构建环境 */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/ci-env/${id}`, { data });

/** 删除构建环境 */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/ci-env/${id}`);

/** 获取所有构建环境列表 */
export const getLstApi = () =>
  http.request<Resp<{ list: Partial<Model>[] }>>("get", "/ci-env/list");
