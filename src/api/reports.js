import apiClient from './client'

export const reportApi = {
  getDailyReport: async (date) => {
    const params = date ? { date } : {}
    const response = await apiClient.get('/reports/daily', { params })
    return response.data
  },
}
