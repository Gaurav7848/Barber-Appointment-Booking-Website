import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentAPI } from '../../utils/appointmentAPI'

export const createAppointment = createAsyncThunk('appointment/create', async (appointmentData, thunkAPI) => {
  try {
    const response = await appointmentAPI.create(appointmentData)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data)
  }
})

export const fetchCustomerAppointments = createAsyncThunk('appointment/fetchCustomer', async (_, thunkAPI) => {
  try {
    const response = await appointmentAPI.fetchCustomer()
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data)
  }
})

const initialState = {
  appointments: [],
  loading: false,
  error: null,
}

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.appointments = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload
        state.loading = false
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload)
        state.loading = false
      })
      .addCase(fetchCustomerAppointments.pending, (state) => {
        state.loading = true
      })
      .addCase(createAppointment.pending, (state) => {
        state.loading = true
      })
  },
})

export const { clearAppointments } = appointmentSlice.actions
export default appointmentSlice.reducer
