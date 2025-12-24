import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type UserProfile = {
  id: string;
  displayName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
};

export type CurrentUserResponse = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  profile?: UserProfile;
};

export type UserProfilePayload = {
  displayName?: string;
  bio?: string;
};

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  profile?: UserProfile;
};

export type RoleRecord = {
  id: string;
  name: string;
  createdAt: string;
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get<ApiResponse<CurrentUserResponse>>('/users/me');
  return unwrapApiResponse(data);
};

export const fetchMyProfile = async () => {
  const { data } = await api.get<ApiResponse<UserProfile | null>>(
    '/users/me/profile',
  );
  return unwrapApiResponse(data);
};

export const createMyProfile = async (payload: UserProfilePayload) => {
  const { data } = await api.post<ApiResponse<UserProfile>>('/users/me/profile', payload);
  return unwrapApiResponse(data);
};

export const updateMyProfile = async (payload: UserProfilePayload) => {
  const { data } = await api.put<ApiResponse<UserProfile>>('/users/me/profile', payload);
  return unwrapApiResponse(data);
};

export const uploadMyAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiResponse<UserProfile>>(
    '/users/me/profile/avatar',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return unwrapApiResponse(data);
};

export const deleteSelfAccount = async () => {
  const { data } = await api.delete<ApiResponse<null>>('/users/me');
  return unwrapApiResponse(data);
};

export const fetchUsers = async () => {
  const { data } = await api.get<ApiResponse<UserRecord[]>>('/users');
  return unwrapApiResponse(data);
};

export const fetchRoles = async () => {
  const { data } = await api.get<ApiResponse<RoleRecord[]>>('/roles');
  return unwrapApiResponse(data);
};

export const assignUserRole = async (userId: string, role: string) => {
  const { data } = await api.post<ApiResponse<null>>(`/users/${userId}/roles`, { role });
  return unwrapApiResponse(data);
};

export const removeUserRole = async (userId: string, role: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/users/${userId}/roles/${role}`);
  return unwrapApiResponse(data);
};

export const deactivateUser = async (userId: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/users/${userId}`);
  return unwrapApiResponse(data);
};

export const activateUser = async (userId: string) => {
  const { data } = await api.put<ApiResponse<null>>(`/users/${userId}/activate`);
  return unwrapApiResponse(data);
};

export const hardDeleteUser = async (userId: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/users/${userId}/permanent`);
  return unwrapApiResponse(data);
};
