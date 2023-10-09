import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  rank: number;
  parentId: number;
  updatedAt: string;
  userIds: number[];
  roleIds: number[];
  hostCount: number;
};

/** 新增主机组 */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/host-group", { data });

/** 获取主机组列表 */
export const getLstApi = (data: { search: string }) =>
  http.request<Resp<{ list: Model[] }>>("get", "/host-group/list", {
    params: data
  });

/** 更新主机组 */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/host-group/${id}`, { data });

/** 删除主机组 */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/host-group/${id}`);

/** 获取主机组列表（包含对应主机数量） */
export const getPartialLstApi = () =>
  http.request<Resp<{ list: Model[] }>>("get", "/host-group/partial-list");
