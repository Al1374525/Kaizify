import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAuthToken } from '../../utils/authUtils';
import { toast } from 'react-toastify';

// Define initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/users/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Login failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Apply auth token to requests if it exists in state
      const { token } = getState().auth;
      if (token) {
        setAuthToken(token);
      }

      const res = await axios.get('/api/users/me');
      return res.data;
    } catch (err) {
      // Clear token on authorization failure
      localStorage.removeItem('token');
      setAuthToken(null);
      return rejectWithValue(err.response?.data?.message || 'Authorization failed');
    }
  }
);

export const auth0Login = createAsyncThunk(
  'auth/auth0Login',
  async (auth0User, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/users/auth0', {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        displayName: auth0User.name || auth0User.nickname,
        picture: auth0User.picture
      });
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Auth0 login failed');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.put('/api/users/me', userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Update failed');
    }
  }
);

export const updateFcmToken = createAsyncThunk(
  'auth/updateFcmToken',
  async (token, { rejectWithValue, getState }) => {
    try {
      const { isAuthenticated } = getState().auth;
      if (!isAuthenticated) return null;
      
      await axios.post('/api/users/fcm-token', { token });
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notification token');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      setAuthToken(null);
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
    resetAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        toast.success('Registration successful!');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Registration failed');
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        toast.success('Login successful!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })

      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Auth0 Login
      .addCase(auth0Login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(auth0Login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        toast.success('Login successful!');
      })
      .addCase(auth0Login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Auth0 login failed');
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        toast.success('Profile updated successfully!');
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Update failed');
      })

      // FCM Token update - silent actions
      .addCase(updateFcmToken.rejected, (state, action) => {
        console.error('FCM token update failed:', action.payload);
      });
  }
});

export const { logout, resetAuthError } = authSlice.actions;

export default authSlice.reducer;