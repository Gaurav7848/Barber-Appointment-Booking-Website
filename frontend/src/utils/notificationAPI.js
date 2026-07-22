import axios from 'axios'

const API_URL = '/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export default {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/notifications`, { headers: getAuthHeader() })
    return response.data
  },
  getUnread: async () => {
    const response = await axios.get(`${API_URL}/notifications/unread`, { headers: getAuthHeader() })
    return response.data
  },
  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeader() })
    return response.data
  },
  markAllAsRead: async () => {
    const response = await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: getAuthHeader() })
    return response.data
  },
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/notifications/${id}`, { headers: getAuthHeader() })
    return response.data
  },
}
