import apiClient from './client'

export const productApi = {
  getAll: async () => {
    const response = await apiClient.get('/products')
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await apiClient.post('/products', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },
}
