import apiClient from './client';
import { User } from '../types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  access_token?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User | null }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },
};