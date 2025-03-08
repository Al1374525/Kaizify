const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const axios = require('axios');

const fetchRewards = createAsyncThunk('rewards/fetchRewards', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/rewards');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const purchaseReward = createAsyncThunk('rewards/purchaseReward', async (rewardId, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/api/rewards/${rewardId}/purchase`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const rewardSlice = createSlice({
  name: 'rewards',
  initialState: { rewards: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => { state.loading = true; })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(purchaseReward.pending, (state) => { state.loading = true; })
      .addCase(purchaseReward.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(purchaseReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

module.exports = rewardSlice;
module.exports.fetchRewards = fetchRewards;
module.exports.purchaseReward = purchaseReward;
module.exports.clearError = rewardSlice.actions.clearError;