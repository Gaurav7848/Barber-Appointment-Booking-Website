import axios from 'axios'

const API_URL = '/api'
const BACKEND_URL = 'http://localhost:5000'

export const authAPI = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  },
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Login failed')
      }
      return response.data
    } catch (proxyError) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials)
        if (response.status >= 400) {
          throw new Error(response.data?.message || 'Login failed')
        }
        return response.data
      } catch (directError) {
        const msg = directError.response?.data?.message || directError.message || 'Login failed'
        throw new Error(msg)
      }
    }
  },
  getProfile: async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
  sendOtp: async (data) => {
    const response = await axios.post(`${API_URL}/auth/send-otp`, data)
    return response.data
  },
  verifyOtp: async (data) => {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, data)
    return response.data
  },
  forgotPassword: async (data) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, data)
    return response.data
  },
  resetPassword: async (otp, data) => {
    const response = await axios.post(`${API_URL}/auth/reset-password/${otp}`, data)
    return response.data
  },
  uploadAvatar: async (formData) => {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/auth/upload-avatar`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
