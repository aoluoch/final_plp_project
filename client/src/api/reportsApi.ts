import { axiosInstance } from './axiosInstance'

export const reportsApi = {
	getFeed: async () => {
		const { data } = await axiosInstance.get('/reports/feed')
		return data.data.reports
	},
	getById: async (id: string) => {
		const { data } = await axiosInstance.get(`/reports/${id}`)
		return data.data.report
	},
	updateMine: async (id: string, payload: { description?: string; notes?: string }) => {
		const { data } = await axiosInstance.patch(`/reports/${id}`, payload)
		return data.data.report
	},
	delete: async (id: string) => {
		await axiosInstance.delete(`/reports/${id}`)
		return true
	},
}


