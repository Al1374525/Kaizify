const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const axios = require('axios');

const fetchGuilds = createAsyncThunk('social/fetchGuilds', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/social');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const createGuild = createAsyncThunk('social/createGuild', async (guildData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/social', guildData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const joinGuild = createAsyncThunk('social/joinGuild', async (guildId, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/api/social/${guildId}/join`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const leaveGuild = createAsyncThunk('social/leaveGuild', async (guildId, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/api/social/${guildId}/leave`);
    return { guildId, ...response.data };
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const fetchActivityFeed = createAsyncThunk('social/fetchActivityFeed', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/social/activity');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const socialSlice = createSlice({
  name: 'social',
  initialState: { guilds: [], activityFeed: [], loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuilds.pending, (state) => { state.loading = true; })
      .addCase(fetchGuilds.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds = action.payload;
      })
      .addCase(fetchGuilds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGuild.pending, (state) => { state.loading = true; })
      .addCase(createGuild.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds.push(action.payload);
      })
      .addCase(createGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(joinGuild.pending, (state) => { state.loading = true; })
      .addCase(joinGuild.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.guilds.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.guilds[index] = action.payload;
      })
      .addCase(joinGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(leaveGuild.pending, (state) => { state.loading = true; })
      .addCase(leaveGuild.fulfilled, (state, action) => {
        state.loading = false;
        state.guilds = state.guilds.filter(g => g._id !== action.payload.guildId);
      })
      .addCase(leaveGuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActivityFeed.pending, (state) => { state.loading = true; })
      .addCase(fetchActivityFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.activityFeed = action.payload;
      })
      .addCase(fetchActivityFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

module.exports = socialSlice;
module.exports.fetchGuilds = fetchGuilds;
module.exports.createGuild = createGuild;
module.exports.joinGuild = joinGuild;
module.exports.leaveGuild = leaveGuild;
module.exports.fetchActivityFeed = fetchActivityFeed;
module.exports.clearError = socialSlice.actions.clearError;