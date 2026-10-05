import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchSellerOrders,
  updateSellerOrderStatus,
  updateSellerOrderPaymentStatus,
  clearError,
} from '../../redux/slices/sellerSlice';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SellerOrders = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { orders, loading, error, pagination } = useSelector((state) => state.seller);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadOrders = () => {
    const params = { page: 1, limit: 50 };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
    dispatch(fetchSellerOrders(params));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateSellerOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast.success('Order status updated');
    } catch (_) { }
  };

  const handlePaymentStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateSellerOrderPaymentStatus({ id: orderId, payment_status: newStatus })).unwrap();
      toast.success('Payment status updated');
    } catch (_) { }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">Manage your store orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Id</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custome Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="pending" className="bg-white text-gray-900">pending</option>
                          <option value="confirmed" className="bg-white text-gray-900">confirmed</option>
                          <option value="processing" className="bg-white text-gray-900">processing</option>
                          <option value="shipped" className="bg-white text-gray-900">shipped</option>
                          <option value="delivered" className="bg-white text-gray-900">delivered</option>
                          <option value="cancelled" className="bg-white text-gray-900">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.payment_status}
                          onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.payment_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          <option value="pending" className="bg-white text-gray-900">pending</option>
                          <option value="paid" className="bg-white text-gray-900">paid</option>
                          <option value="failed" className="bg-white text-gray-900">failed</option>
                          <option value="refunded" className="bg-white text-gray-900">refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toast.success('Viewing details for #' + order.order_number)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
