import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import organizationReducer from './features/organization/organizationSlice'
import appointmentReducer from './features/appointment/appointmentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    appointment: appointmentReducer,
  },
})
