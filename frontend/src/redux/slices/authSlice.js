import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed' });
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to resend OTP' });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Ensure no old tokens are sent with login request
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
        headers: {
          // Explicitly don't send Authorization header for login
          'Content-Type': 'application/json',
        },
      });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Flag to prevent multiple simultaneous calls
let isGettingUser = false;

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    // Prevent multiple simultaneous calls
    if (isGettingUser) {
      return rejectWithValue({ message: 'Already loading', skipLogout: true });
    }

    try {
      isGettingUser = true;
      const token = localStorage.getItem('token');
      if (!token) {
        isGettingUser = false;
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      isGettingUser = false;
      return response.data;
    } catch (error) {
      isGettingUser = false;
      // Only reject with proper error info
      const errorMessage = error.response?.data || { message: 'Failed to get user' };
      return rejectWithValue({
        ...errorMessage,
        status: error.response?.status,
        isAuthError: error.response?.status === 401 || error.response?.status === 403,
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/auth/updatedetails`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/auth/updatepassword`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update password' });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send reset email' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/resetpassword/${token}`, { password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reset password' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          // If logout request fails (e.g., token expired), continue with cleanup
          console.log('Logout request failed, but continuing with cleanup:', error.message);
        }
      }
      // Always clear tokens from localStorage, regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      // Even if logout request fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null; // Return null instead of reject to ensure state is cleared
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  emailVerified: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.emailVerified = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data?.user;
        state.isAuthenticated = true;
        state.emailVerified = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data?.user;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        
        // Check error type
        const isAuthError = action.payload?.isAuthError;
        const skipLogout = action.payload?.skipLogout;
        const isAlreadyLoading = action.payload?.message === 'Already loading';
        
        // Don't logout for "Already loading" or skipLogout errors - they're not real errors
        if (isAlreadyLoading || skipLogout) {
          state.error = null;
          return;
        }
        
        // Only clear auth state and logout if it's a real authentication error (401/403)
        if (isAuthError) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.error = action.payload;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } else {
          // For other errors (network, server errors, etc.), keep user logged in
          // Don't clear auth state - just show error
          state.error = action.payload;
        }
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.otpSent = false;
        state.emailVerified = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear state
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.otpSent = false;
        state.emailVerified = false;
      });
  },
});

export const { clearError, resetAuthState, setLoading } = authSlice.actions;
export default authSlice.reducer;
