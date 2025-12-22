import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type ArticleAuthorProfile = {
  id: string;
  displayName: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  createdAt?: string;
};

export type ArticleAuthor = {
  id: string;
  username: string;
  profile?: ArticleAuthorProfile;
};

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type ArticleTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  isDeleted: boolean;
  commentsCount: number;
  createdAt: string;
  author: ArticleAuthor;
  category: ArticleCategory;
  tags: ArticleTag[];
};

export type PagedResponse<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isAscending: boolean;
};

export type ArticleQueryParams = {
  page?: number;
  pageSize?: number;
  isAscending?: boolean;
  categorySlug?: string;
  tagSlug?: string;
  keyword?: string;
  includeDeleted?: boolean;
};

export type CreateArticlePayload = {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  isPublished?: boolean;
  tagIds?: string[];
};

export const fetchArticles = async (params?: ArticleQueryParams) => {
  const { data } = await api.get<ApiResponse<PagedResponse<Article>>>('/articles', { params });
  return unwrapApiResponse(data);
};

export const fetchArticleBySlug = async (slug: string) => {
  const { data } = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
  return unwrapApiResponse(data);
};

export const fetchArticleById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Article>>(`/articles/id/${id}`);
  return unwrapApiResponse(data);
};

export const createArticle = async (payload: CreateArticlePayload) => {
  const { data } = await api.post<ApiResponse<Article>>('/articles', payload);
  return unwrapApiResponse(data);
};

export const updateArticle = async (id: string, payload: Partial<CreateArticlePayload>) => {
  const { data } = await api.put<ApiResponse<Article>>(`/articles/${id}`, payload);
  return unwrapApiResponse(data);
};

export const softDeleteArticle = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/articles/${id}`);
  return unwrapApiResponse(data);
};

export const restoreArticle = async (id: string) => {
  const { data } = await api.put<ApiResponse<null>>(`/articles/${id}/restore`);
  return unwrapApiResponse(data);
};

export const hardDeleteArticle = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/articles/${id}/hard`);
  return unwrapApiResponse(data);
};

export const uploadArticleImage = async (articleId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<
    ApiResponse<{ imageId: string; url: string }>
  >(`/articles/${articleId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapApiResponse(data);
};
