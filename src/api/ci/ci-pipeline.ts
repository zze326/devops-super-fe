import { EnumModel } from "@/utils/enum";
import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  desc: string;
  kubernetesConfigId: number;
  kubernetesNamespace: string;
  config: Config;
};

// 任务类型
export enum ETaskType {
  GIT_PULL = 1,
  SHELL_EXEC = 2
}

// 任务类型枚举
export const ETaskTypeModel = new EnumModel([
  { value: ETaskType.GIT_PULL, display: "Git 拉取" },
  { value: ETaskType.SHELL_EXEC, display: "Shell 执行" }
]);

// 任务数据结构
export type Task = {
  type: ETaskType;
  gitPullData?: Partial<GitPullData>;
  shellExecData?: Partial<ShellExecData>;
};
// Git 拉取任务数据结构
export type GitPullData = {
  gitUrl: string;
  branch: string;
  secretId: number;
};

// Shell 执行任务数据结构
export type ShellExecData = {
  workDir: string;
  content: string;
};

// 流水线配置
export type Config = ConfigEnvItem[];

export type ConfigEnvItem = {
  id: number;
  name?: string;
  stages: ConfigEnvStageItem[];
};

export type ConfigEnvStageItem = {
  name: string;
  tasks: Task[];
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

/** 运行流水线 */
export const runApi = (id: number) =>
  http.request<Resp<null>>("post", `/ci-pipeline/${id}/run`);
