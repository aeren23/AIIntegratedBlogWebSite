import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type LogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
};

export type LogQueryParams = {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  userId?: string;
};

export type PagedLogs = {
  items: LogEntry[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isAscending: boolean;
};

export const fetchLogs = async (params?: LogQueryParams) => {
  const { data } = await api.get<ApiResponse<PagedLogs>>('/logs', { params });
  return unwrapApiResponse(data);
};

export const deleteLog = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/logs/${id}`);
  return unwrapApiResponse(data);
};
