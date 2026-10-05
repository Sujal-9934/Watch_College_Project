import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../redux/slices/orderSlice';
import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, DocumentArrowDownIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, error } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Only fetch orders if user exists (don't call getCurrentUser again - Layout handles it)
    if (user && isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement update profile API call
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  // Show loading state while checking authentication or loading user data
  if (loading || (!user && isAuthenticated)) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if there's an auth error (but don't show for network errors)
  if (error && error.isAuthError && !user) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error.message || 'Authentication failed'}</p>
            <p className="text-sm text-gray-600">Please login again to continue.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    if (user) {
                      setFormData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        date_of_birth: user.date_of_birth || '',
                        gender: user.gender || '',
                      });
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Recent Orders */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/orders"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex-1 text-center px-3 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                          const token = localStorage.getItem('token');
                          const response = await axios.get(`${API_BASE_URL}/orders/${order.id}/receipt`, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `Order-${order.order_number}-Receipt.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          toast.success('Receipt downloaded successfully');
                        } catch (error) {
                          console.error('Download error:', error);
                          toast.error('Failed to download receipt');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No orders yet</p>
              <Link
                to="/products"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <Link
              to="/orders"
              className="block px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Order History
            </Link>
            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
