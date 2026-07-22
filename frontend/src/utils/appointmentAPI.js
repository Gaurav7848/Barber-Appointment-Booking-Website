import axios from 'axios'

const API_URL = '/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const appointmentAPI = {
  create: async (appointmentData) => {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData, { headers: getAuthHeader() })
    return response.data
  },
  fetchCustomer: async () => {
    const response = await axios.get(`${API_URL}/appointments/customer`, { headers: getAuthHeader() })
    return response.data
  },
  fetchOrganization: async (orgId) => {
    const response = await axios.get(`${API_URL}/appointments/organization/${orgId}`, { headers: getAuthHeader() })
    return response.data
  },
  updateStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/appointments/${id}/status`, { status }, { headers: getAuthHeader() })
    return response.data
  },
  cancel: async (id) => {
    const response = await axios.put(`${API_URL}/appointments/${id}/cancel`, {}, { headers: getAuthHeader() })
    return response.data
  },
}

export const paymentAPI = {
  createOrder: async (appointmentId) => {
    const response = await axios.post(`${API_URL}/payment/create-order`, { appointmentId }, { headers: getAuthHeader() })
    return response.data
  },
  verify: async (paymentData) => {
    const response = await axios.post(`${API_URL}/payment/verify`, paymentData, { headers: getAuthHeader() })
    return response.data
  },
}
