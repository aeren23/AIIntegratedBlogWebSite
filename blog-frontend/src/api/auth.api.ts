import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export const loginApi = async (payload: LoginPayload) => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return unwrapApiResponse(data);
};

export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  return unwrapApiResponse(data);
};
