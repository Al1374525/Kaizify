import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Thunks
export const fetchGuilds = createAsyncThunk(
  'social/fetchGuilds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/social');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch guilds');
    }
  }
);

export const createGuild = createAsyncThunk(
  'social/createGuild',
  async (guildData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/social', guildData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create guild');
    }
  }
);

export const joinGuild = createAsyncThunk(
  'social/joinGuild',
  async (guildId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/social/${guildId}/join`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to join guild');
    }
  }
);

export const leaveGuild = createAsyncThunk(
  'social/leaveGuild',
  async (guildId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/social/${guildId}/leave`);
      return { guildId, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to leave guild');
    }
  }
);

export const fetchActivityFeed = createAsyncThunk(
  'social/fetchActivityFeed',
  async (_, { rejectWithValue }) => {
    try {
      // Placeholder: Could fetch from a dedicated endpoint or derive from guilds
      const response = await axios.get('/api/social/activity'); // Hypothetical
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch activity feed');
    }
  }
);

// Initial State
const initialState = {
  guilds: [],
  activityFeed: [],
  loading: false,
  error: null,
};

// Slice
const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Guilds
    builder
      .addCase(fetchGuilds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuilds.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds = action.payload;
      })
      .addCase(fetchGuilds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Create Guild
      .addCase(createGuild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuild.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds.push(action.payload);
        toast.success('Guild created successfully!');
      })
      .addCase(createGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Join Guild
      .addCase(joinGuild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGuild.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.guilds.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) state.guilds[index] = action.payload;
        else state.guilds.push(action.payload);
        toast.success('Joined guild successfully!');
      })
      .addCase(joinGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Leave Guild
      .addCase(leaveGuild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveGuild.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds = state.guilds.filter((g) => g._id !== action.payload.guildId);
        toast.success('Left guild successfully!');
      })
      .addCase(leaveGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Activity Feed
      .addCase(fetchActivityFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.activityFeed = action.payload;
      })
      .addCase(fetchActivityFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError } = socialSlice.actions;
export default socialSlice.reducer;