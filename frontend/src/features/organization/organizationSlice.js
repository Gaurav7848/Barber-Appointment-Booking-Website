import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { organizationAPI } from '../../utils/organizationAPI'

export const createOrganization = createAsyncThunk('organization/create', async (formData, thunkAPI) => {
  try {
    const response = await organizationAPI.create(formData)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data)
  }
})

export const fetchOrganizations = createAsyncThunk('organization/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await organizationAPI.fetchAll(params)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data)
  }
})

const initialState = {
  organizations: [],
  currentOrganization: null,
  loading: false,
  error: null,
}

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload
        state.loading = false
      })
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setCurrentOrganization } = organizationSlice.actions
export default organizationSlice.reducer
