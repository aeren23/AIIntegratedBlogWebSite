import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
};

export const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<Category[]>>('/categories');
  return unwrapApiResponse(data);
};

export const fetchCategoryBySlug = async (slug: string) => {
  const { data } = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
  return unwrapApiResponse(data);
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  const { data } = await api.post<ApiResponse<Category>>('/categories', payload);
  return unwrapApiResponse(data);
};

export const updateCategory = async (id: string, payload: Partial<CreateCategoryPayload>) => {
  const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return unwrapApiResponse(data);
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return unwrapApiResponse(data);
};
