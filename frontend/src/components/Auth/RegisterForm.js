import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import { setAuthModalTab, setAuthEmail } from '../../redux/slices/uiSlice';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const { loading, error, otpSent } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (otpSent) {
      toast.success('Registration successful! Please check your email for verification OTP.');
      dispatch(setAuthEmail(formData.email));
      dispatch(setAuthModalTab('otp-verification'));
    }
  }, [otpSent, dispatch, formData.email]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Registration failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address (e.g. abc@gmail.com)');
      return;
    }

    // Password validation
    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await dispatch(registerUser(registrationData)).unwrap();
    } catch (error) {
      // Error is handled in useEffect
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
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
        />
        {formData.email && !validateEmail(formData.email) && (
          <p className="mt-1 text-xs text-red-600">Please enter a valid email address (e.g. abc@gmail.com)</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Create password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)"
          value={formData.password}
          onChange={handleChange}
        />
        {formData.password && !validatePassword(formData.password) && (
          <p className="mt-1 text-xs text-red-600">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-500"
          onClick={() => dispatch(setAuthModalTab('login'))}
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
