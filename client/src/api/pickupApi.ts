import { axiosInstance } from './axiosInstance'
import { 
  PickupTask, 
  PickupSchedule, 
  CreatePickupData, 
  PickupFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '../types'

export const pickupApi = {
  async getTasks(filters?: PickupFilters, page = 1, limit = 10): Promise<PaginatedResponse<PickupTask>> {
    const params = new URLSearchParams()
    
    if (filters?.status) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.start)
      params.append('endDate', filters.dateRange.end)
    }
    if (filters?.collectorId) {
      params.append('collectorId', filters.collectorId)
    }
    
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    const response = await axiosInstance.get<ApiResponse<any>>(
      `/pickups/tasks?${params.toString()}`
    )
    
    const responseData = response.data.data
    return {
      data: responseData.pickupTasks || [],
      pagination: responseData.pagination || {
        page: page,
        limit: limit,
        total: 0,
        totalPages: 0
      }
    }
  },

  async getTask(id: string): Promise<PickupTask> {
    const response = await axiosInstance.get<ApiResponse<PickupTask>>(`/pickups/tasks/${id}`)
    return response.data.data
  },

  async createTask(data: CreatePickupData): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>('/pickups/tasks', data)
    return response.data.data
  },

  async updateTask(id: string, data: Partial<PickupTask>): Promise<PickupTask> {
    const response = await axiosInstance.put<ApiResponse<PickupTask>>(`/pickups/tasks/${id}`, data)
    return response.data.data
  },

  async deleteTask(id: string): Promise<void> {
    await axiosInstance.delete(`/pickups/tasks/${id}`)
  },

  async startTask(id: string): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>(`/pickups/tasks/${id}/start`)
    return response.data.data
  },

  async completeTask(id: string, notes?: string): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>(
      `/pickups/tasks/${id}/complete`,
      { notes }
    )
    return response.data.data
  },

  async cancelTask(id: string, reason?: string): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>(
      `/pickups/tasks/${id}/cancel`,
      { reason }
    )
    return response.data.data
  },

  async getSchedule(collectorId: string, date: string): Promise<PickupSchedule> {
    const response = await axiosInstance.get<ApiResponse<PickupSchedule>>(
      `/pickups/schedule/${collectorId}?date=${date}`
    )
    return response.data.data
  },

  async getMyTasks(page = 1, limit = 10): Promise<PaginatedResponse<PickupTask>> {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/pickups/my-tasks?page=${page}&limit=${limit}`
      )
      
      // Handle the backend response structure
      const responseData = response.data.data
      
      return {
        data: responseData.pickupTasks || [],
        pagination: responseData.pagination || {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error: any) {
      console.error('Error fetching my tasks:', error.response?.data || error.message)
      // Return empty result instead of throwing to prevent crashes
      return {
        data: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      }
    }
  },

  async rescheduleTask(id: string, newDate: string): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>(
      `/pickups/tasks/${id}/reschedule`,
      { scheduledDate: newDate }
    )
    return response.data.data
  },

  async getCollectorStats(): Promise<any> {
    try {
      // Add cache-busting parameter to avoid cached 429 responses
      const cacheBuster = Date.now()
      const response = await axiosInstance.get<ApiResponse<any>>(`/pickups/collector/stats?_=${cacheBuster}`)
      return response.data.data
    } catch (error: any) {
      console.error('Error fetching collector stats:', error.response?.data || error.message)
      // Return default stats instead of throwing to prevent crashes
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        scheduled: 0,
        cancelled: 0,
        completionRate: 0,
        today: {
          total: 0,
          completed: 0,
          inProgress: 0,
          scheduled: 0,
          totalDuration: 0,
          highPriority: 0
        },
        thisWeek: {
          total: 0,
          completed: 0,
          completionRate: 0
        }
      }
    }
  },

  async getCollectorPerformance(period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const response = await axiosInstance.get<ApiResponse<any>>(`/pickups/collector/performance?period=${period}`)
    return response.data.data
  },
}
