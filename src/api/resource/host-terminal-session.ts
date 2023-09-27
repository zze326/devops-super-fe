import { http } from "@/utils/http";
export type Model = {
  id: number;
  hostId: number;
  hostAddr: string;
  hostName: string;
  operatorId: number;
  operatorName: string;
  operatorRealName: string;
  startTime: string;
  filepath: string;
  updatedAt: string;
};

/** 获取主机会话记录列表 */
export const getPageLstApi = (data: IReqPagerData) =>
  http.request<Resp<IRespPagerData<Model>>>(
    "get",
    "/host-terminal-session/page-list",
    {
      params: data
    }
  );

/** 检查会话文件是否存在 */
export const checkSessionFileApi = (id: number) =>
  http.request<Resp<{ exists: boolean }>>(
    "get",
    `/host-terminal-session/${id}/check-file`
  );
