import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type CommentUser = {
  id: string;
  username: string;
  profile?: {
    displayName?: string | null;
    profileImageUrl?: string | null;
  };
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  parentCommentId?: string | null;
  user: CommentUser;
};

type CommentNodeApi = {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  children?: CommentNodeApi[];
  isDeleted?: boolean;
  parentCommentId?: string | null;
};

export type CreateCommentPayload = {
  content: string;
  parentCommentId?: string;
};

export type UpdateCommentPayload = Partial<CreateCommentPayload>;

const normalizeComment = (
  comment: CommentNodeApi,
  parentCommentId: string | null,
): Comment => ({
  id: comment.id,
  content: comment.content,
  createdAt: comment.createdAt,
  user: comment.user,
  parentCommentId: comment.parentCommentId ?? parentCommentId,
  isDeleted: comment.isDeleted ?? comment.content === '[deleted]',
});

const flattenCommentTree = (
  nodes: CommentNodeApi[],
  parentCommentId: string | null = null,
): Comment[] =>
  nodes.flatMap((comment) => {
    const node = normalizeComment(comment, parentCommentId);
    const children = comment.children?.length
      ? flattenCommentTree(comment.children, comment.id)
      : [];
    return [node, ...children];
  });

const normalizeCommentList = (items: CommentNodeApi[]): Comment[] => {
  if (items.some((comment) => Array.isArray(comment.children))) {
    return flattenCommentTree(items);
  }
  return items.map((comment) => normalizeComment(comment, comment.parentCommentId ?? null));
};

export const fetchCommentsByArticle = async (articleId: string) => {
  const { data } = await api.get<ApiResponse<CommentNodeApi[]>>(
    `/articles/${articleId}/comments`,
  );
  return normalizeCommentList(unwrapApiResponse(data));
};

export const createComment = async (articleId: string, payload: CreateCommentPayload) => {
  const { data } = await api.post<ApiResponse<CommentNodeApi>>(
    `/articles/${articleId}/comments`,
    {
      ...payload,
      articleId,
    },
  );
  const created = unwrapApiResponse(data);
  return normalizeComment(created, payload.parentCommentId ?? null);
};

export const updateComment = async (commentId: string, payload: UpdateCommentPayload) => {
  const { data } = await api.put<ApiResponse<CommentNodeApi>>(`/comments/${commentId}`, payload);
  const updated = unwrapApiResponse(data);
  return normalizeComment(updated, updated.parentCommentId ?? null);
};

export const deleteComment = async (commentId: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/comments/${commentId}`);
  return unwrapApiResponse(data);
};

export const hardDeleteComment = async (commentId: string) => {
  const { data } = await api.delete<ApiResponse<null>>(
    `/comments/${commentId}/permanent`,
  );
  return unwrapApiResponse(data);
};
