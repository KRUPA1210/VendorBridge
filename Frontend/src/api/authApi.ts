// Authentication API endpoints
import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROCUREMENT_OFFICER' | 'MANAGER' | 'VENDOR' | 'USER';
  phoneNumber?: string;
  country?: string;
  additionalInfo?: string;
}

export interface AuthResponse {
  message: string;
  expiresIn: number;
  role?: string;
  userName?: string;
  email?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/api/v1/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post('/api/v1/auth/create', payload),

  logout: () =>
    api.post('/api/v1/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (resetToken: string, newPassword: string) =>
    api.post('/api/v1/auth/reset-password', { resetToken, newPassword }),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken }),

  verifyUser: (email: string, code: string) =>
    api.post('/api/v1/auth/verify-user', { email, code }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/v1/auth/change-password', { currentPassword, newPassword }),
};
