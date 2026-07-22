import axios from 'axios'

const API_URL = '/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const organizationAPI = {
  create: async (formData) => {
    const response = await axios.post(`${API_URL}/organizations`, formData, {
      headers: getAuthHeader(),
    })
    return response.data
  },
  fetchAll: async (params) => {
    const response = await axios.get(`${API_URL}/organizations`, { params, headers: getAuthHeader() })
    return response.data
  },
  fetchOne: async (id) => {
    const response = await axios.get(`${API_URL}/organizations/${id}`, { headers: getAuthHeader() })
    return response.data
  },
  update: async (id, formData) => {
    const response = await axios.put(`${API_URL}/organizations/${id}`, formData, {
      headers: getAuthHeader(),
    })
    return response.data
  },
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/organizations/${id}`, { headers: getAuthHeader() })
    return response.data
  },
}
