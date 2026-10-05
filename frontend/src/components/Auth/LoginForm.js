import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import { setAuthModalOpen, setAuthModalTab } from '../../redux/slices/uiSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Login failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(setAuthModalOpen(false));
      // Redirect admin users to admin dashboard
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin', { replace: true });
      } 
      // Redirect seller users to seller dashboard
      else if (user.role === 'seller') {
        navigate('/seller', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

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

        // OTP login successful - update Redux state directly
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Update Redux state directly for OTP login
          dispatch({
            type: 'auth/login/fulfilled',
            payload: response.data
          });
        }

        toast.success('Login successful!');
        // Redirect will be handled by useEffect when user state updates
      } catch (error) {
        toast.error(error.response?.data?.message || 'Invalid OTP');
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          disabled={otpSent && loginMethod === 'otp'}
        />
        {formData.email && !validateEmail(formData.email) && (
          <p className="mt-1 text-xs text-red-600">Please enter a valid email address (e.g. abc@gmail.com)</p>
        )}
      </div>

      {loginMethod === 'otp' ? (
        <>
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={otpLoading || !formData.email || !validateEmail(formData.email)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, otp: value });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading}
                className="w-full text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {otpLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
              </button>
            </>
          )}
        </>
      ) : (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-0 right-0 bottom-0 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 cursor-pointer border-0 bg-transparent"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500"
            onClick={() => dispatch(setAuthModalOpen(false))}
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || (loginMethod === 'otp' && (!otpSent || formData.otp.length !== 6))}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : loginMethod === 'otp' ? 'Verify & Login' : 'Sign In'}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-500"
          onClick={() => dispatch(setAuthModalTab('register'))}
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
