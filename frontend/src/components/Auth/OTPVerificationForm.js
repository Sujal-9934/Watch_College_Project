import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendOTP, clearError } from '../../redux/slices/authSlice';
import { setAuthModalTab, setAuthModalOpen } from '../../redux/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OTPVerificationForm = ({ onVerified }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { authEmail } = useSelector((state) => state.ui);
  const email = authEmail;

  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && onVerified) {
      onVerified();
    }
  }, [isAuthenticated, onVerified]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Verification failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim and validate OTP
    const cleanOTP = otp.trim().replace(/\D/g, '');
    
    if (!cleanOTP || cleanOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await dispatch(verifyEmail({ email, otp: cleanOTP })).unwrap();
      toast.success('Email verified successfully!');
      dispatch(setAuthModalOpen(false)); // Close the modal
      if (onVerified) {
        onVerified();
      } else {
        navigate('/');
      }
    } catch (error) {
      // Error is handled in useEffect
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await dispatch(resendOTP(email)).unwrap();
      toast.success('OTP resent successfully!');
    } catch (error) {
      // Error is handled in useEffect
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Enter OTP
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            value={otp}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-widest"
            placeholder="000000"
            required
            autoFocus
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Sending...' : "Didn't receive code? Resend OTP"}
          </button>
          <div>
            <button
              type="button"
              onClick={() => dispatch(setAuthModalTab('login'))}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OTPVerificationForm;

