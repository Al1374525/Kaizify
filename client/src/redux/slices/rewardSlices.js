// client/src/redux/slices/rewardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Thunks
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/rewards');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch rewards');
    }
  }
);

export const purchaseReward = createAsyncThunk(
  'rewards/purchaseReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/rewards/${rewardId}/purchase`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to purchase reward');
    }
  }
);

// Initial State
const initialState = {
  rewards: [],
  loading: false,
  error: null,
};

// Slice
const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Rewards
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Purchase Reward
      .addCase(purchaseReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseReward.fulfilled, (state, action) => {
        state.loading = false;
        // Update user state via authSlice or refetch profile if needed
        toast.success('Reward purchased successfully!');
      })
      .addCase(purchaseReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError } = rewardSlice.actions;
export default rewardSlice.reducer;