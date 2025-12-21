import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type CurrentUserResponse = {
  id: string;
  username: string;
  roles: string[];
};

export type UserProfile = {
  id: string;
  displayName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
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
