import { EnumModel } from "@/utils/enum";
import { http } from "@/utils/http";

export type Model = {
  id: number;
  name: string;
  desc: string;
  kubernetesConfigId: number;
  kubernetesNamespace: string;
  parameterize: boolean;
  params: Param[];
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

// 参数类型
export enum EParamType {
  GIT_BRANCH = 1,
  ENUM_LIST = 2,
  STRING = 3,
  BOOLEAN = 4
}

// 参数类型枚举
export const EParamTypeModel = new EnumModel([
  { value: EParamType.GIT_BRANCH, display: "Git 分支" },
  { value: EParamType.ENUM_LIST, display: "枚举列表" },
  { value: EParamType.STRING, display: "字符串" },
  { value: EParamType.BOOLEAN, display: "布尔值" }
]);

// 参数结构
export type Param = {
  type: EParamType;
  name: string;
  display: string;
  enumListData?: string[];
  gitUrl?: string;
  secretId?: number;
};

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
export const runApi = (id: number, params = {}) =>
  http.request<Resp<null>>("post", `/ci-pipeline/${id}/run`, {
    data: { params }
  });

/** 克隆流水线 */
export const cloneApi = (id: number, newName: string) =>
  http.request<Resp<null>>("post", `/ci-pipeline/${id}/clone`, {
    data: {
      newName
    }
  });
