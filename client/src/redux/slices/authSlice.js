const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const axios = require('axios');

const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/users/profile');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await axios.put('/api/users/profile', profileData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, loading: false, error: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => { state.loading = true; })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => { state.loading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

module.exports = authSlice;
module.exports.getProfile = getProfile;
module.exports.updateProfile = updateProfile;
module.exports.setUser = authSlice.actions.setUser;
module.exports.clearError = authSlice.actions.clearError;