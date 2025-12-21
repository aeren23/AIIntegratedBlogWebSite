import api, { type ApiResponse, unwrapApiResponse } from './axios';
import type { CurrentUserResponse } from './user.api';

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: CurrentUserResponse;
  children: Comment[];
};

export type CreateCommentPayload = {
  content: string;
  parentCommentId?: string;
};

export type UpdateCommentPayload = Partial<CreateCommentPayload>;

export const fetchCommentsByArticle = async (articleId: string) => {
  const { data } = await api.get<ApiResponse<Comment[]>>(`/articles/${articleId}/comments`);
  return unwrapApiResponse(data);
};

export const createComment = async (articleId: string, payload: CreateCommentPayload) => {
  const { data } = await api.post<ApiResponse<Comment>>(`/articles/${articleId}/comments`, {
    ...payload,
    articleId,
  });
  return unwrapApiResponse(data);
};

export const updateComment = async (commentId: string, payload: UpdateCommentPayload) => {
  const { data } = await api.put<ApiResponse<Comment>>(`/comments/${commentId}`, payload);
  return unwrapApiResponse(data);
};

export const deleteComment = async (commentId: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/comments/${commentId}`);
  return unwrapApiResponse(data);
};
