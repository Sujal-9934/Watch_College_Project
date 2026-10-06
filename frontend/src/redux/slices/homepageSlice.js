import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { defaultSliders } from '../../utils/defaultSliders';
import { API_BASE_URL } from '../../utils/api';

// Fetch active sliders for homepage
export const fetchActiveSliders = createAsyncThunk(
  'homepage/fetchActiveSliders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sliders/active`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sliders' });
    }
  }
);

// Initial state
const initialState = {
  sliders: [],
  loading: false,
  error: null,
};

// Homepage slice
const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSliders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSliders.fulfilled, (state, action) => {
        state.loading = false;
        state.sliders = Array.isArray(action.payload?.data) ? action.payload.data : defaultSliders;
      })
      .addCase(fetchActiveSliders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Use default sliders as fallback when API fails
        state.sliders = defaultSliders;
      });
  },
});

export const { clearError } = homepageSlice.actions;
export default homepageSlice.reducer;
