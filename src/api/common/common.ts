import { http } from "@/utils/http";

// 获取 kubernetes 集群中指定名称空间的 pvc
export const getGitBranchLstApi = (gitUrl: string, secretId: number) =>
  http.request<Resp<{ branches: string[] }>>("get", "/common/git-branch-list", {
    params: {
      gitUrl,
      secretId
    }
  });
