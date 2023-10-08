import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  hostAddr: string;
  port: number;
  username: string;
  password: string;
  privateKey: string;
  useKey: boolean;
  desc: string;
  saveSession: boolean;
  hostGroupId: number;
};

export const getApi = (id: number) =>
  http.request<Resp<Model>>("get", `/host/${id}`);

/** 新增主机 */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/host", { data });

/** 获取主机列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>("get", "/host/page-list", {
    params: data
  });

/** 更新主机 */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/host/${id}`, { data });

/** 删除主机 */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/host/${id}`);

/** 测试是否可以 ssh 连接 */
export const testSshApi = (id: number) =>
  http.request<Resp<null>>("get", `/host/${id}/ssh-ok`);

/** 获取当前用户拥有权限的主机列表 */
export const getAuthorizedLstApi = () =>
  http.request<Resp<{ list: Model[] }>>("get", "/host/authorized-list");
