import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSellerDashboard, clearError } from '../../redux/slices/sellerSlice';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const SellerAnalytics = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load analytics');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const stats = dashboardStats?.stats || {};
  const salesByMonth = dashboardStats?.salesByMonth || [];
  const totalRevenue = stats.revenue?.total ?? 0;
  const maxRevenue = Math.max(...salesByMonth.map((s) => parseFloat(s.revenue || 0)), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Sales and revenue overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-amber-500 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <ShoppingBagIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orders?.total ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Revenue by Month (Last 6 Months)</h2>
          </div>
          <div className="p-6">
            {salesByMonth.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No sales data yet</div>
            ) : (
              <div className="space-y-4">
                {salesByMonth.map((row) => {
                  const rev = parseFloat(row.revenue || 0);
                  const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                  return (
                    <div key={row.month} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-gray-700">{row.month}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-28 text-sm text-right font-medium text-gray-900">
                        ₹{rev.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-500">({row.orders} orders)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
