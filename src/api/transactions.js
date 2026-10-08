import apiClient from './client'

export const transactionApi = {
  getAll: async () => {
    const response = await apiClient.get('/transactions')
    return response.data
  },

  create: async (payload) => {
    // payload: { items: [{ product_id: number, qty: number }] }
    const response = await apiClient.post('/transactions', payload)
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data
  },
}
