import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type CreateTagPayload = {
  name: string;
  slug: string;
};

export const fetchTags = async () => {
  const { data } = await api.get<ApiResponse<Tag[]>>('/tags');
  return unwrapApiResponse(data);
};

export const fetchTagBySlug = async (slug: string) => {
  const { data } = await api.get<ApiResponse<Tag>>(`/tags/${slug}`);
  return unwrapApiResponse(data);
};

export const createTag = async (payload: CreateTagPayload) => {
  const { data } = await api.post<ApiResponse<Tag>>('/tags', payload);
  return unwrapApiResponse(data);
};

export const updateTag = async (id: string, payload: Partial<CreateTagPayload>) => {
  const { data } = await api.put<ApiResponse<Tag>>(`/tags/${id}`, payload);
  return unwrapApiResponse(data);
};

export const deleteTag = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/tags/${id}`);
  return unwrapApiResponse(data);
};
