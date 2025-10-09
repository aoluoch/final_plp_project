import { axiosInstance } from './axiosInstance'
import { AuthUser, LoginCredentials, RegisterData, User, ApiResponse } from '../types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await axiosInstance.post<ApiResponse<AuthUser>>('/auth/login', credentials)
    return response.data.data
  },

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await axiosInstance.post<ApiResponse<AuthUser>>('/auth/register', data)
    return response.data.data
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<AuthUser> {
    const response = await axiosInstance.post<ApiResponse<AuthUser>>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  },

  async verifyToken(): Promise<AuthUser> {
    const response = await axiosInstance.get<ApiResponse<AuthUser>>('/auth/verify')
    return response.data.data
  },

  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>('/auth/profile', data)
    return response.data.data
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await axiosInstance.put('/auth/change-password', data)
  },

  async forgotPassword(email: string): Promise<void> {
    await axiosInstance.post('/auth/forgot-password', { email })
  },

  async resetPassword(data: { token: string; password: string }): Promise<void> {
    await axiosInstance.post('/auth/reset-password', data)
  },
}
