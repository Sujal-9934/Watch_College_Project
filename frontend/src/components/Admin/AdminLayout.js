import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, getCurrentUser } from '../../redux/slices/authSlice';
import { clearCartLocal } from '../../redux/slices/cartSlice';
import AdminSidebar from './AdminSidebar';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Restore user session if token exists
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      // Clear cart state first
      dispatch(clearCartLocal());
      // Logout user (this will clear tokens and auth state)
      await dispatch(logoutUser());
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      // Navigate to home
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails, clear local state and redirect
      dispatch(clearCartLocal());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Back to Site</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-gray-500">({user?.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* Admin Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

