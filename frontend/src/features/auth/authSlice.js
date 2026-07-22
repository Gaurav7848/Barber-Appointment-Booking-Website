import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../utils/authAPI'

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await authAPI.login(credentials)
    return response
  } catch (error) {
    const message = error?.message || 'Login failed'
    return thunkAPI.rejectWithValue(message)
  }
})

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await authAPI.register(userData)
    return response
  } catch (error) {
    const message = error?.message || 'Registration failed'
    return thunkAPI.rejectWithValue(message)
  }
})

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.token = action.payload.token
        localStorage.setItem('user', JSON.stringify(action.payload))
        localStorage.setItem('token', action.payload.token)
        state.loading = false
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
        state.token = action.payload.token
        localStorage.setItem('user', JSON.stringify(action.payload))
        localStorage.setItem('token', action.payload.token)
        state.loading = false
      })
      .addCase(login.pending, (state) => {
        state.loading = true
      })
      .addCase(register.pending, (state) => {
        state.loading = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer
