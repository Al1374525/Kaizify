// client/src/redux/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Thunks
export const fetchAnalyticsSummary = createAsyncThunk(
  'analytics/fetchAnalyticsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/summary');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Initial State
const initialState = {
  summary: {
    questsCompleted: 0,
    questsByCategory: {},
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
    skillPoints: {},
  },
  loading: false,
  error: null,
};

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;