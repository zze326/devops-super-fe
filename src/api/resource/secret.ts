import { EnumModel } from "@/utils/enum";
import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  type: number;
  content: UsernamePasswordContent | TextContent | {};
};

export type UsernamePasswordContent = {
  username: string;
  password: string;
};

export type TextContent = {
  text: string;
};

// 任务类型
export enum ESecretType {
  GIT_BASIC_AUTH = 1,
  KUBERNETES_CONFIG = 2
}

// 任务类型枚举
export const ESecretTypeModel = new EnumModel([
  { value: ESecretType.GIT_BASIC_AUTH, display: "Git Baisc 认证" },
  { value: ESecretType.KUBERNETES_CONFIG, display: "Kubernetes Config" }
]);

/** 新增秘钥 */
export const addApi = (data: Partial<Model>) =>
  http.request<Resp<null>>("post", "/secret", { data });

/** 分页获取秘钥列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>("get", "/secret/page-list", {
    params: data
  });

/** 更新秘钥 */
export const uptApi = (id: number, data: Partial<Model>) =>
  http.request<Resp<null>>("put", `/secret/${id}`, { data });

/** 删除秘钥 */
export const delApi = (id: number) =>
  http.request<Resp<null>>("delete", `/secret/${id}`);

/** 获取所有秘钥列表 */
export const getLstApi = (params: any) =>
  http.request<Resp<{ list: Partial<Model>[] }>>("get", "/secret/list", {
    params
  });
