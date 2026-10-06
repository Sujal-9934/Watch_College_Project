import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!validateEmail(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      await dispatch(forgotPassword(email.trim())).unwrap();
      setStep(2);
    } catch (err) {
      // Error shown via useEffect + toast
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <span className="text-2xl font-bold text-primary-600">My Clock</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1
            ? 'Enter your email and we’ll send you a link to reset your password.'
            : 'Check your inbox for the reset link.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We’ve sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Didn’t receive the email? Check spam or{' '}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
