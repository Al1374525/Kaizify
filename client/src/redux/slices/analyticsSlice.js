const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const axios = require('axios');

const fetchAnalyticsSummary = createAsyncThunk('analytics/fetchAnalyticsSummary', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/analytics/summary');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    summary: { questsCompleted: 0, questsByCategory: {}, currentStreak: 0, longestStreak: 0, totalXp: 0, skillPoints: {} },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => { state.loading = true; })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

module.exports = analyticsSlice;
module.exports.fetchAnalyticsSummary = fetchAnalyticsSummary;
module.exports.clearError = analyticsSlice.actions.clearError;