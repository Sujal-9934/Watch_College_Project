import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSellerDashboard, clearError } from '../../redux/slices/sellerSlice';
import toast from 'react-hot-toast';
import {
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load dashboard');
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
  const recentOrders = dashboardStats?.recentOrders || [];
  const lowStockProducts = dashboardStats?.lowStockProducts || [];

  const statCards = [
    {
      name: 'Total Products',
      value: stats.products?.total ?? 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
      link: '/seller/products',
    },
    {
      name: 'Total Orders',
      value: stats.orders?.total ?? 0,
      icon: ShoppingBagIcon,
      color: 'bg-green-500',
      link: '/seller/orders',
    },
    {
      name: 'Total Revenue',
      value: `₹${(stats.revenue?.total ?? 0).toLocaleString('en-IN')}`,
      icon: CurrencyDollarIcon,
      color: 'bg-amber-500',
      link: '/seller/analytics',
    },
    {
      name: 'Pending Orders',
      value: stats.orders?.pending ?? 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      link: '/seller/orders?status=pending',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your store performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders yet</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-3 text-sm text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {order.first_name} {order.last_name}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {recentOrders.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link to="/seller/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all orders →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <div className="overflow-x-auto">
              {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">All products are well stocked</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lowStockProducts.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-3 text-sm text-gray-900">{p.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{p.sku}</td>
                        <td className="px-6 py-3 text-sm text-red-600 font-medium">{p.stock_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {lowStockProducts.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link to="/seller/products" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Manage products →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/seller/products"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <CubeIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-gray-700">Manage Products</p>
            </Link>
            <Link
              to="/seller/orders"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-gray-700">View Orders</p>
            </Link>
            <Link
              to="/seller/analytics"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-gray-700">View Analytics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
