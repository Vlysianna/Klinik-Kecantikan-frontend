import apiClient from './client'

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/login', credentials)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/user')
    return response.data
  },
}
