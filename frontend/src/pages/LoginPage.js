import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect admin users to admin dashboard
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin', { replace: true });
      } 
      // Redirect seller users to seller dashboard
      else if (user.role === 'seller') {
        navigate('/seller', { replace: true });
      }
      // Regular users go to home page (/) after login
      else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Login failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address (e.g. abc@gmail.com)');
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/send-login-otp`, { email: formData.email });
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address (e.g. abc@gmail.com)');
      return;
    }

    if (loginMethod === 'otp') {
      // Trim and validate OTP
      const cleanOTP = formData.otp.trim().replace(/\D/g, '');
      
      if (!cleanOTP || cleanOTP.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }

      try {
        // Ensure no stale tokens before login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        const response = await axios.post(`${API_BASE_URL}/auth/login-with-otp`, {
          email: formData.email.trim(),
          otp: cleanOTP,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Backend sends: { success: true, message, token, refreshToken, user }
        if (response.data.success && response.data.token) {
          const { token, refreshToken, user } = response.data;
          
          // Store tokens
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Update Redux state by dispatching the fulfilled action
          // Format matches what loginUser.fulfilled expects: { user, token, refreshToken }
          const userData = user || response.data.user;
          dispatch({
            type: 'auth/loginUser/fulfilled',
            payload: {
              user: userData,
              token: token,
              refreshToken: refreshToken || response.data.refreshToken,
            },
          });

          toast.success('Login successful!');
          
          // Redirect based on user role - regular users go to home page
          if (userData?.role === 'admin' || userData?.role === 'super_admin') {
            navigate('/admin', { replace: true });
          } else if (userData?.role === 'seller') {
            navigate('/seller', { replace: true });
          } else {
            // Regular users go to home page (/)
            navigate('/', { replace: true });
          }
        } else {
          throw new Error(response.data.message || 'Invalid response from server');
        }
      } catch (error) {
        console.error('OTP Login Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
        toast.error(errorMessage);
        
        // Clear OTP field on error
        setFormData({ ...formData, otp: '' });
      }
    } else {
      if (!formData.password) {
        toast.error('Please enter your password');
        return;
      }

      try {
        // Ensure no stale tokens before login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap();
        toast.success('Login successful!');
        // Redirect will be handled by useEffect when user state updates
      } catch (error) {
        // Error is handled in useEffect
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
                setFormData({ ...formData, otp: '' });
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                loginMethod === 'password'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setOtpSent(false);
                setFormData({ ...formData, password: '', otp: '' });
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                loginMethod === 'otp'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              OTP Login
            </button>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent && loginMethod === 'otp'}
              />
            </div>
            {loginMethod === 'otp' ? (
              <>
                {!otpSent ? (
                  <div className="p-3 bg-gray-50 rounded-b-md">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || !formData.email || !validateEmail(formData.email)}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="otp" className="sr-only">
                        Enter OTP
                      </label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="6"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                        placeholder="000000"
                        value={formData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData({ ...formData, otp: value });
                        }}
                      />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-b-md">
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="w-full text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                      >
                        {otpLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (loginMethod === 'otp' && (!otpSent || formData.otp.length !== 6))}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : loginMethod === 'otp' ? 'Verify & Login' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Don't have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
