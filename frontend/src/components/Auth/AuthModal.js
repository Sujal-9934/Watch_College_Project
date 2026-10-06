import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthModalOpen, setAuthModalTab } from '../../redux/slices/uiSlice';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPVerificationForm from './OTPVerificationForm';

const AuthModal = () => {
  const dispatch = useDispatch();
  const { authModalOpen, authModalTab } = useSelector((state) => state.ui);

  if (!authModalOpen) return null;

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
  };

  const switchTab = (tab) => {
    dispatch(setAuthModalTab(tab));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {authModalTab === 'login' ? 'Sign In' :
                 authModalTab === 'register' ? 'Create Account' :
                 'Verify Email'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 px-4 text-center font-medium text-sm rounded-l-lg border ${
                  authModalTab === 'login'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`flex-1 py-2 px-4 text-center font-medium text-sm rounded-r-lg border-t border-r border-b ${
                  authModalTab === 'register'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content */}
            {authModalTab === 'login' ? <LoginForm /> :
             authModalTab === 'register' ? <RegisterForm /> :
             <OTPVerificationForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
