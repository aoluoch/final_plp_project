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

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<PickupTask>>>(
      `/pickups/tasks?${params.toString()}`
    )
    return response.data.data
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
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<PickupTask>>>(
      `/pickups/my-tasks?page=${page}&limit=${limit}`
    )
    return response.data.data
  },

  async rescheduleTask(id: string, newDate: string): Promise<PickupTask> {
    const response = await axiosInstance.post<ApiResponse<PickupTask>>(
      `/pickups/tasks/${id}/reschedule`,
      { scheduledDate: newDate }
    )
    return response.data.data
  },
}
