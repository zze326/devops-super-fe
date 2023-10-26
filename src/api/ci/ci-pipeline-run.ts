import { http } from "@/utils/http";

export type Model = {
  id: number;
  pipelineId: number;
  podName: string;
  namespace: string;
  createdAt: string;
  updatedAt: string;
};

/** 分页获取流水线运行历史列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>(
    "get",
    "/ci-pipeline-run/page-list",
    {
      params: data
    }
  );

/** 取消运行中的流水线 */
export const cancelApi = (id: number) =>
  http.request<Resp<IRespPagerData<Model>>>(
    "delete",
    `/ci-pipeline-run/${id}/cancel`
  );
