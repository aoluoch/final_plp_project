import { axiosInstance } from './axiosInstance'
import { ApiResponse } from '../types'

export interface DashboardStats {
  totalReports: number
  pendingReports: number
  completedReports: number
  totalCollectors: number
  activeCollectors: number
  totalResidents: number
  activeResidents: number
  reportsThisMonth: number
  reportsLastMonth: number
  completionRate: number
}

export interface ReportAnalytics {
  reportsByType: Array<{ type: string; count: number }>
  reportsByStatus: Array<{ status: string; count: number }>
  reportsByPriority: Array<{ priority: string; count: number }>
  reportsByMonth: Array<{ month: string; count: number }>
  averageCompletionTime: number
  topCollectors: Array<{ collectorId: string; name: string; completedTasks: number }>
}

export interface UserAnalytics {
  usersByRole: Array<{ role: string; count: number }>
  usersByMonth: Array<{ month: string; count: number }>
  activeUsers: number
  inactiveUsers: number
}

export const adminApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
    return response.data.data
  },

  async getReports(filters?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    priority?: string
    search?: string
  }): Promise<{ reports: any[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axiosInstance.get<ApiResponse<{ reports: any[]; pagination: any }>>(
      `/admin/reports?${params.toString()}`
    )
    return response.data.data
  },

  async getUsers(filters?: {
    page?: number
    limit?: number
    role?: string
    status?: string
    search?: string
  }): Promise<{ users: any[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axiosInstance.get<ApiResponse<{ users: any[]; pagination: any }>>(
      `/admin/users?${params.toString()}`
    )
    return response.data.data
  },

  async updateReportStatus(reportId: string, status: string, notes?: string): Promise<void> {
    await axiosInstance.patch(`/admin/reports/${reportId}/status`, { status, notes })
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive })
  },

  async getReportAnalytics(dateRange?: { start: string; end: string }): Promise<ReportAnalytics> {
    const params = new URLSearchParams()
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }

    const response = await axiosInstance.get<ApiResponse<ReportAnalytics>>(
      `/admin/analytics/reports?${params.toString()}`
    )
    return response.data.data
  },

  async getUserAnalytics(dateRange?: { start: string; end: string }): Promise<UserAnalytics> {
    const params = new URLSearchParams()
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }

    const response = await axiosInstance.get<ApiResponse<UserAnalytics>>(
      `/admin/analytics/users?${params.toString()}`
    )
    return response.data.data
  },

  async exportReports(format: 'csv' | 'excel', filters?: Record<string, unknown>): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axiosInstance.get(`/admin/export/reports?${params.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportUsers(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await axiosInstance.get(`/admin/export/users?format=${format}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async getSystemLogs(page = 1, limit = 50, level?: string): Promise<{ logs: unknown[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    
    if (level) {
      params.append('level', level)
    }

    const response = await axiosInstance.get(`/admin/logs?${params.toString()}`)
    return response.data
  },

  async updateSystemSettings(settings: Record<string, unknown>): Promise<void> {
    await axiosInstance.put('/admin/settings', settings)
  },

  async getSystemSettings(): Promise<Record<string, unknown>> {
    const response = await axiosInstance.get('/admin/settings')
    return response.data.data
  },

  async exportReports(format: 'csv' | 'excel', filters?: Record<string, unknown>): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axiosInstance.get(`/admin/export/reports?${params.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportUsers(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await axiosInstance.get(`/admin/export/users?format=${format}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
